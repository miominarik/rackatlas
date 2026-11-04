// rackatlas-terminal: opens a shell for the RackAtlas web terminal without any inbound port.
//
// The service reads URL, TOKEN and TERMINAL_USER from /etc/rackatlas-agent/agent.conf. It asks
// RackAtlas whether the terminal is switched on for this server and where the bridge is, then keeps
// one outbound WebSocket to the bridge. Shells are started only when the bridge asks for one.
//
// Frames from the bridge (JSON text): open {id, cols, rows}, key {id, pub}, r {id, c, r}, close {id}.
// Binary frames carry 4 bytes of session id followed by encrypted keystrokes. Frames to the bridge:
// ready, key, exit and error as JSON text, encrypted shell output as binary with the same 4 byte
// prefix. The shell output only starts after the browser sent its key. See e2e.go for the encryption.
package main

import (
	"bufio"
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"os/user"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

// version is set at build time with -ldflags "-X main.version=...".
var version = "dev"

const (
	pollInterval   = 60 * time.Second
	minBackoff     = 15 * time.Second
	maxBackoff     = 120 * time.Second
	maxShells      = 5
	readBufferSize = 32 * 1024

	// A browser has to send its key within this time after the shell was opened.
	handshakeTimeout = 20 * time.Second
)

// ident is the identity key of this service, loaded once at start.
var ident *identity

type config struct {
	url          string
	token        string
	terminalUser string
}

type shell struct {
	cmd   *exec.Cmd
	ptmx  *os.File
	keyed chan struct{} // closed once the encrypted channel is set up

	mu      sync.Mutex
	session *secureSession
}

func (s *shell) secure() *secureSession {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.session
}

type connection struct {
	ws     *websocket.Conn
	cfg    config
	mu     sync.Mutex // gorilla/websocket allows one writer at a time
	shells map[uint32]*shell
	shMu   sync.Mutex
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--version" {
		fmt.Println("rackatlas-terminal", version)
		return
	}

	confPath := os.Getenv("RACKATLAS_CONF")
	if confPath == "" {
		confPath = "/etc/rackatlas-agent/agent.conf"
	}

	keyPath := filepath.Join(filepath.Dir(confPath), "terminal.key")

	var err error
	if ident, err = loadIdentity(keyPath); err != nil {
		log.Fatalf("identity key %s: %v (run as root)", keyPath, err)
	}

	if len(os.Args) > 1 && os.Args[1] == "--fingerprint" {
		fmt.Println(ident.fingerprint())
		return
	}

	log.Printf("identity fingerprint %s", ident.fingerprint())

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	backoff := minBackoff

	for ctx.Err() == nil {
		cfg, err := readConfig(confPath)
		if err != nil {
			log.Printf("configuration: %v", err)
			sleep(ctx, pollInterval)
			continue
		}

		bridge, err := askBridge(ctx, cfg)
		if err != nil {
			log.Printf("could not ask RackAtlas: %v", err)
			sleep(ctx, backoff)
			backoff = min(backoff*2, maxBackoff)
			continue
		}

		if bridge == "" {
			// Switched off for this server. Look again in a minute.
			backoff = minBackoff
			sleep(ctx, pollInterval)
			continue
		}

		started := time.Now()
		if err := serve(ctx, cfg, bridge); err != nil && ctx.Err() == nil {
			log.Printf("bridge connection ended: %v", err)
		}

		// A connection that held for a while was healthy, so reconnect quickly.
		if time.Since(started) > 5*time.Minute {
			backoff = minBackoff
		} else {
			backoff = min(backoff*2, maxBackoff)
		}

		sleep(ctx, backoff)
	}
}

func sleep(ctx context.Context, d time.Duration) {
	select {
	case <-ctx.Done():
	case <-time.After(d):
	}
}

// readConfig reads only the known keys. The file is never executed.
func readConfig(path string) (config, error) {
	file, err := os.Open(path)
	if err != nil {
		return config{}, err
	}
	defer file.Close()

	cfg := config{terminalUser: "root"}
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		key, value, found := strings.Cut(scanner.Text(), "=")
		if !found {
			continue
		}

		switch strings.TrimSpace(key) {
		case "URL":
			cfg.url = strings.TrimRight(strings.TrimSpace(value), "/")
		case "TOKEN":
			cfg.token = strings.TrimSpace(value)
		case "TERMINAL_USER":
			if v := strings.TrimSpace(value); v != "" {
				cfg.terminalUser = v
			}
		}
	}

	if !strings.HasPrefix(cfg.url, "https://") || cfg.token == "" {
		return config{}, errors.New("URL (https) and TOKEN have to be set in agent.conf")
	}

	return cfg, scanner.Err()
}

// askBridge returns the bridge address, or an empty string while the terminal is switched off.
func askBridge(ctx context.Context, cfg config) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, cfg.url+"/api/agent/terminal", nil)
	if err != nil {
		return "", err
	}

	request.Header.Set("Authorization", "Bearer "+cfg.token)
	request.Header.Set("Accept", "application/json")
	request.Header.Set("X-Agent-Version", version)

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	if response.StatusCode == http.StatusUnauthorized {
		return "", errors.New("the token was rejected, install the agent again with a new token")
	}

	if response.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected answer %d", response.StatusCode)
	}

	var body struct {
		Enabled bool   `json:"enabled"`
		URL     string `json:"url"`
	}

	if err := json.NewDecoder(io.LimitReader(response.Body, 4096)).Decode(&body); err != nil {
		return "", err
	}

	if !body.Enabled || body.URL == "" {
		return "", nil
	}

	parsed, err := url.Parse(body.URL)
	if err != nil || (parsed.Scheme != "wss" && parsed.Scheme != "ws") {
		return "", errors.New("the bridge address is not a WebSocket address")
	}

	// The token must not travel in clear text, only a loopback bridge may use ws://.
	if parsed.Scheme == "ws" && parsed.Hostname() != "127.0.0.1" && parsed.Hostname() != "localhost" {
		return "", errors.New("refusing an unencrypted bridge address")
	}

	return strings.TrimRight(body.URL, "/") + "/agent", nil
}

func serve(ctx context.Context, cfg config, bridge string) error {
	dialer := websocket.Dialer{HandshakeTimeout: 15 * time.Second}
	header := http.Header{}
	header.Set("Authorization", "Bearer "+cfg.token)

	ws, _, err := dialer.DialContext(ctx, bridge, header)
	if err != nil {
		return err
	}

	c := &connection{ws: ws, cfg: cfg, shells: map[uint32]*shell{}}
	defer c.closeAll()
	defer ws.Close()

	// The bridge pings every 30 seconds, so silence for longer means the connection is dead.
	ws.SetReadDeadline(time.Now().Add(90 * time.Second))
	ws.SetPingHandler(func(data string) error {
		ws.SetReadDeadline(time.Now().Add(90 * time.Second))
		c.mu.Lock()
		defer c.mu.Unlock()
		return ws.WriteControl(websocket.PongMessage, []byte(data), time.Now().Add(5*time.Second))
	})

	go func() {
		<-ctx.Done()
		ws.Close()
	}()

	log.Printf("connected to the bridge")

	for {
		kind, data, err := ws.ReadMessage()
		if err != nil {
			return err
		}

		ws.SetReadDeadline(time.Now().Add(90 * time.Second))

		if kind == websocket.BinaryMessage {
			c.input(data)
			continue
		}

		c.control(data)
	}
}

func (c *connection) send(kind int, data []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.ws.SetWriteDeadline(time.Now().Add(15 * time.Second))
	if err := c.ws.WriteMessage(kind, data); err != nil {
		c.ws.Close()
	}
}

func (c *connection) status(kind string, id uint32, message string) {
	body := map[string]any{"t": kind, "id": id}
	if message != "" {
		body["message"] = message
	}

	data, _ := json.Marshal(body)
	c.send(websocket.TextMessage, data)
}

func (c *connection) input(data []byte) {
	if len(data) <= 4 {
		return
	}

	c.shMu.Lock()
	id := binary.BigEndian.Uint32(data)
	s := c.shells[id]
	c.shMu.Unlock()

	if s == nil {
		return
	}

	session := s.secure()
	if session == nil {
		// Plain keystrokes are never accepted, the browser has to finish the handshake first.
		return
	}

	plain, err := session.open(data[4:])
	if err != nil {
		c.status("error", id, "The encrypted data could not be verified.")
		s.stop()
		return
	}

	s.ptmx.Write(plain)
}

// key answers the key of the browser and switches the shell to the encrypted channel.
func (c *connection) key(id uint32, pub string) {
	c.shMu.Lock()
	s := c.shells[id]
	c.shMu.Unlock()

	if s == nil || s.secure() != nil {
		return
	}

	reply, session, err := ident.accept(id, pub)
	if err != nil {
		c.status("error", id, "The encrypted handshake failed.")
		s.stop()
		return
	}

	c.send(websocket.TextMessage, reply)

	s.mu.Lock()
	s.session = session
	s.mu.Unlock()
	close(s.keyed)
}

func (c *connection) control(data []byte) {
	var m struct {
		T    string `json:"t"`
		ID   uint32 `json:"id"`
		Cols uint16 `json:"cols"`
		Rows uint16 `json:"rows"`
		C    uint16 `json:"c"`
		R    uint16 `json:"r"`
		Pub  string `json:"pub"`
	}

	if json.Unmarshal(data, &m) != nil {
		return
	}

	switch m.T {
	case "open":
		go c.open(m.ID, m.Cols, m.Rows)
	case "key":
		c.key(m.ID, m.Pub)
	case "r":
		c.shMu.Lock()
		s := c.shells[m.ID]
		c.shMu.Unlock()
		if s != nil && m.C > 0 && m.R > 0 {
			pty.Setsize(s.ptmx, &pty.Winsize{Cols: m.C, Rows: m.R})
		}
	case "close":
		c.shMu.Lock()
		s := c.shells[m.ID]
		c.shMu.Unlock()
		if s != nil {
			s.stop()
		}
	}
}

func (s *shell) stop() {
	s.ptmx.Close()
	if s.cmd.Process != nil {
		// Hang up the session like a closed terminal window does.
		syscall.Kill(-s.cmd.Process.Pid, syscall.SIGHUP)
	}
}

func (c *connection) open(id uint32, cols, rows uint16) {
	c.shMu.Lock()
	if len(c.shells) >= maxShells {
		c.shMu.Unlock()
		c.status("error", id, "Too many terminals are open on this server.")
		return
	}
	c.shMu.Unlock()

	account, err := user.Lookup(c.cfg.terminalUser)
	if err != nil {
		c.status("error", id, "The terminal user does not exist on the server.")
		return
	}

	uid, _ := strconv.ParseUint(account.Uid, 10, 32)
	gid, _ := strconv.ParseUint(account.Gid, 10, 32)
	shellPath := loginShell(account.Username)

	// -l makes a login shell, so the profile of the user is read like after an SSH login.
	cmd := exec.Command(shellPath, "-l")
	cmd.Dir = account.HomeDir
	cmd.Env = []string{
		"TERM=xterm-256color",
		"LANG=C.UTF-8",
		"HOME=" + account.HomeDir,
		"USER=" + account.Username,
		"LOGNAME=" + account.Username,
		"SHELL=" + shellPath,
		"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
	}

	if os.Geteuid() == 0 && uint32(uid) != 0 {
		groups := []uint32{uint32(gid)}
		if ids, err := account.GroupIds(); err == nil {
			groups = groups[:0]
			for _, g := range ids {
				if n, err := strconv.ParseUint(g, 10, 32); err == nil {
					groups = append(groups, uint32(n))
				}
			}
		}
		cmd.SysProcAttr = &syscall.SysProcAttr{Credential: &syscall.Credential{Uid: uint32(uid), Gid: uint32(gid), Groups: groups}}
	}

	if cols == 0 {
		cols = 80
	}
	if rows == 0 {
		rows = 24
	}

	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{Cols: cols, Rows: rows})
	if err != nil {
		c.status("error", id, "The shell could not be started.")
		return
	}

	s := &shell{cmd: cmd, ptmx: ptmx, keyed: make(chan struct{})}

	c.shMu.Lock()
	c.shells[id] = s
	c.shMu.Unlock()

	c.status("ready", id, "")

	// Nothing is printed before the browser has set up the encryption. The output waits in the pty.
	select {
	case <-s.keyed:
		prefix := make([]byte, 4)
		binary.BigEndian.PutUint32(prefix, id)
		buffer := make([]byte, readBufferSize)
		session := s.secure()

		for {
			n, err := ptmx.Read(buffer)
			if n > 0 {
				c.send(websocket.BinaryMessage, append(append([]byte{}, prefix...), session.seal(buffer[:n])...))
			}
			if err != nil {
				break
			}
		}
	case <-time.After(handshakeTimeout):
		c.status("error", id, "The browser did not set up the encryption. Update the agent and the page.")
	}

	s.stop()
	cmd.Wait()

	c.shMu.Lock()
	delete(c.shells, id)
	c.shMu.Unlock()

	c.status("exit", id, "")
}

func (c *connection) closeAll() {
	c.shMu.Lock()
	defer c.shMu.Unlock()

	for _, s := range c.shells {
		s.stop()
	}
}

// loginShell returns the shell of the account from /etc/passwd, or /bin/sh when it has none that works.
func loginShell(name string) string {
	file, err := os.Open("/etc/passwd")
	if err == nil {
		defer file.Close()
		scanner := bufio.NewScanner(file)

		for scanner.Scan() {
			fields := strings.Split(scanner.Text(), ":")
			if len(fields) >= 7 && fields[0] == name {
				if path := fields[6]; path != "" && !strings.HasSuffix(path, "nologin") && !strings.HasSuffix(path, "/false") {
					if _, err := os.Stat(path); err == nil {
						return path
					}
				}
				break
			}
		}
	}

	return "/bin/sh"
}
