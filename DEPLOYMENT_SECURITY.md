# Production security and WebRTC operations

## Required secrets

Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, `TURN_SHARED_SECRET` (at least 32 random bytes), `TURN_REALM`, `CLIENT_URL`, Mongo credentials, and Cloudinary credentials in the deployment secret store. Generate the TURN secret with `openssl rand -hex 32`; never commit it. The browser TURN username and credential must be generated server-side using coturn's shared-secret REST authentication scheme (a Unix expiry timestamp plus user ID, and an HMAC-SHA1 credential). Do not place a long-lived TURN password in Vite environment variables.

## Coturn

`coturn/turnserver.conf` enables long-term shared-secret authentication, STUN/TURN on 3478 (UDP/TCP), TURN-over-TLS on 5349, nonce replay resistance, and a bounded relay-port range. Mount valid Let's Encrypt `fullchain.pem` and `privkey.pem` through `TURN_CERTS_DIR`; ensure coturn can read them. `VITE_TURN_URL` may contain `turn:turn.example.com:3478?transport=udp,turn:turn.example.com:3478?transport=tcp,turns:turn.example.com:5349?transport=tcp` and must receive short-lived credentials from a protected endpoint before starting a call.

Google STUN (`stun:stun.l.google.com:19302`) is used first to discover direct paths. TURN is the secure relay fallback. SDP and ICE candidates pass only through Socket.IO; audio/video tracks remain between browsers or traverse coturn, never the Node API.

## Nginx and host

Terminate TLS at Nginx, proxy `/api` and Socket.IO with `Upgrade`/`Connection` headers, disable directory listing and server tokens, set a request body limit, and add CSP, HSTS, frame-ancestors, nosniff, and referrer-policy headers. Forward `X-Forwarded-Proto` and only allow the known frontend origin.

On Ubuntu: `ufw default deny incoming`; allow 22/tcp, 80/tcp, 443/tcp, 3478/tcp, 3478/udp, 5349/tcp, and UDP 49160:49200 for TURN relays. Enable Fail2Ban's sshd jail and an Nginx auth/request-flood jail. Do not publish MongoDB.

## Uploads

The existing image attachment path uses Cloudinary data URLs. For arbitrary files, add a dedicated upload service that writes outside the web root to quarantine, invokes ClamAV (`clamdscan`), verifies declared MIME, extension, and magic bytes using `file-type`, assigns a cryptographically random filename, then moves only clean files to durable object storage. Store metadata and checksum in MongoDB, never executable files or original client filenames. This is intentionally not emulated with a weak in-process scan.
