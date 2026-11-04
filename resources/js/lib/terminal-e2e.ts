/**
 * End-to-end encryption of the web terminal, the browser side of agent/terminal/e2e.go.
 *
 * The bridge only relays ciphertext. The service on the server signs the handshake with its identity
 * key; the user trusts the fingerprint of that key once (like an SSH host key) and the browser pins it.
 */

const LABEL = 'rackatlas-terminal-e2e-v1';
const encoder = new TextEncoder();

export type KeyReply = { pub: string; ident: string; sig: string };

const toBase64 = (bytes: Uint8Array): string => {
    let text = '';

    bytes.forEach((byte) => {
        text += String.fromCharCode(byte);
    });

    return btoa(text);
};

const fromBase64 = (text: string): Uint8Array =>
    Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

const concat = (...parts: Uint8Array[]): Uint8Array => {
    const out = new Uint8Array(
        parts.reduce((sum, part) => sum + part.length, 0),
    );
    let offset = 0;

    parts.forEach((part) => {
        out.set(part, offset);
        offset += part.length;
    });

    return out;
};

const buffer = (bytes: Uint8Array): ArrayBuffer =>
    bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;

/** SHA256:<base64 without padding> of the public key point, the same text the server prints. */
export async function fingerprintOf(publicKey: Uint8Array): Promise<string> {
    const hash = new Uint8Array(
        await crypto.subtle.digest('SHA-256', buffer(publicKey)),
    );

    return `SHA256:${toBase64(hash).replace(/=+$/, '')}`;
}

function nonce(counter: number): ArrayBuffer {
    const out = new Uint8Array(12);
    const view = new DataView(out.buffer);

    view.setUint32(4, Math.floor(counter / 2 ** 32));
    view.setUint32(8, counter >>> 0);

    return out.buffer;
}

/** One direction after the other: frames are numbered, so a lost or repeated one fails to decrypt. */
export class SecureChannel {
    private sent = 0;
    private received = 0;
    private sendChain: Promise<unknown> = Promise.resolve();
    private receiveChain: Promise<unknown> = Promise.resolve();

    constructor(
        private readonly sendKey: CryptoKey,
        private readonly receiveKey: CryptoKey,
    ) {}

    encrypt(plain: Uint8Array): Promise<Uint8Array> {
        const counter = this.sent++;
        const result = this.sendChain.then(
            async () =>
                new Uint8Array(
                    await crypto.subtle.encrypt(
                        { name: 'AES-GCM', iv: nonce(counter) },
                        this.sendKey,
                        buffer(plain),
                    ),
                ),
        );

        this.sendChain = result.catch(() => undefined);

        return result;
    }

    decrypt(data: Uint8Array): Promise<Uint8Array> {
        const counter = this.received++;
        const result = this.receiveChain.then(
            async () =>
                new Uint8Array(
                    await crypto.subtle.decrypt(
                        { name: 'AES-GCM', iv: nonce(counter) },
                        this.receiveKey,
                        buffer(data),
                    ),
                ),
        );

        this.receiveChain = result.catch(() => undefined);

        return result;
    }
}

export type VerifiedHandshake = {
    /** What the user compares with the output of `rackatlas-terminal --fingerprint` on the server. */
    fingerprint: string;
    /** Derives the keys. Call it only after the fingerprint is trusted. */
    open: () => Promise<SecureChannel>;
};

export type Handshake = {
    /** Base64 public key to send to the service. */
    publicKey: string;
    /** Checks the signed answer. Throws when it does not verify. */
    verify: (reply: KeyReply) => Promise<VerifiedHandshake>;
};

export async function beginHandshake(): Promise<Handshake> {
    const pair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
    );
    const browserPub = new Uint8Array(
        await crypto.subtle.exportKey('raw', pair.publicKey),
    );

    return {
        publicKey: toBase64(browserPub),
        verify: async (reply) => {
            const servicePub = fromBase64(reply.pub);
            const identPub = fromBase64(reply.ident);
            const signature = fromBase64(reply.sig);

            if (
                servicePub.length !== 65 ||
                identPub.length !== 65 ||
                signature.length !== 64
            ) {
                throw new Error('Malformed handshake.');
            }

            const transcript = concat(
                encoder.encode(LABEL),
                browserPub,
                servicePub,
            );
            const identity = await crypto.subtle.importKey(
                'raw',
                buffer(identPub),
                { name: 'ECDSA', namedCurve: 'P-256' },
                false,
                ['verify'],
            );
            const valid = await crypto.subtle.verify(
                { name: 'ECDSA', hash: 'SHA-256' },
                identity,
                buffer(signature),
                buffer(transcript),
            );

            if (!valid) {
                throw new Error('The handshake signature is not valid.');
            }

            return {
                fingerprint: await fingerprintOf(identPub),
                open: async () => {
                    const remote = await crypto.subtle.importKey(
                        'raw',
                        buffer(servicePub),
                        { name: 'ECDH', namedCurve: 'P-256' },
                        false,
                        [],
                    );
                    const secret = await crypto.subtle.deriveBits(
                        { name: 'ECDH', public: remote },
                        pair.privateKey,
                        256,
                    );
                    const salt = await crypto.subtle.digest(
                        'SHA-256',
                        buffer(transcript),
                    );
                    const material = await crypto.subtle.importKey(
                        'raw',
                        secret,
                        'HKDF',
                        false,
                        ['deriveKey'],
                    );
                    const derive = (direction: string) =>
                        crypto.subtle.deriveKey(
                            {
                                name: 'HKDF',
                                hash: 'SHA-256',
                                salt,
                                info: encoder.encode(`${LABEL} ${direction}`),
                            },
                            material,
                            { name: 'AES-GCM', length: 256 },
                            false,
                            ['encrypt', 'decrypt'],
                        );

                    return new SecureChannel(
                        await derive('c2s'),
                        await derive('s2c'),
                    );
                },
            };
        },
    };
}

const pinKey = (serverId: number) => `rackatlas.terminal.identity.${serverId}`;

/** The fingerprint the user trusted for this server in this browser, if any. */
export function pinnedFingerprint(serverId: number): string | null {
    try {
        return localStorage.getItem(pinKey(serverId));
    } catch {
        return null;
    }
}

export function pinFingerprint(serverId: number, fingerprint: string): void {
    try {
        localStorage.setItem(pinKey(serverId), fingerprint);
    } catch {
        // Private mode: the user is asked again next time.
    }
}
