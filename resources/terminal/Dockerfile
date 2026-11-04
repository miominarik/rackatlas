# Web terminal bridge (WebSocket <-> SSH). Build with this folder as the context:
#   docker build -t rackatlas-terminal resources/terminal
#   docker run -p 8787:8787 -e APP_URL=https://rackatlas.dev -e TERMINAL_SECRET=... rackatlas-terminal
FROM node:26-alpine

WORKDIR /app

# ssh2 is pure JavaScript here, so no build tools are needed.
RUN npm install --omit=dev --no-audit --no-fund --no-package-lock ssh2@^1.17.0 ws@^8.22.1 \
    && npm cache clean --force

COPY server.mjs ./

# Inside a container the app has to listen on all interfaces to be reachable from outside.
ENV NODE_ENV=production \
    TERMINAL_HOST=0.0.0.0 \
    TERMINAL_PORT=443

EXPOSE 443

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.TERMINAL_PORT||443)+'/up').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
s