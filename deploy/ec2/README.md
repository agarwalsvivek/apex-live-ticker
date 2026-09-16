# EC2 deploy (api + web)

Docker Compose stack: `nginx` (static frontend + reverse proxy + TLS),
`api` (Express, Node), `certbot` (renews the TLS cert). The web app ships
as a pre-built static bundle rsynced from your machine; the api image
builds itself from source on the server, so the box only needs Docker.

## One-time server setup

```bash
scp -i ~/.ssh/my-server-key.pem deploy/ec2/server-bootstrap.sh \
  ubuntu@<EC2_HOST>:~/
ssh -i ~/.ssh/my-server-key.pem ubuntu@<EC2_HOST> 'bash server-bootstrap.sh'
```

Installs Docker + the compose plugin. If Docker was freshly installed,
reconnect once (`exit` then ssh back in) so your user's group membership
picks up.

Security group: open 22, 80, 443.

## Every deploy

From the repo root:

```bash
npm run deploy:ec2
```

This reads `EC2_HOST`/`EC2_KEY`/`EC2_USER` from `deploy/ec2/.env` if that
file exists (gitignored — copy the values from the one-time setup above),
otherwise pass them inline:

```bash
EC2_HOST=<EC2_HOST> EC2_KEY=~/.ssh/my-server-key.pem npm run deploy:ec2
```

(Or run the two scripts it wraps directly: `./deploy/ec2/build-artifacts.sh`
then `EC2_HOST=... EC2_KEY=... ./deploy/ec2/push-deploy.sh`.)

`build-artifacts.sh` builds `apps/web/dist` (static assets that call
same-origin `/api/*` — nginx proxies that to the `api` container).
`push-deploy.sh` rsyncs what's needed and runs `docker compose up -d --build`
on the server.

First deploy comes up on plain HTTP (port 80) — the checked-in
`nginx/conf.d/app.conf` doesn't reference a cert yet.

## First-time HTTPS

Once the stack is up over HTTP, ssh in and switch on TLS:

```bash
ssh -i ~/.ssh/my-server-key.pem ubuntu@<EC2_HOST>
cd ~/apex-live-ticker/deploy/ec2
DOMAIN=<EC2_HOST> EMAIL=<your-email> ./init-letsencrypt.sh
```

`DOMAIN` is your EC2 public DNS name (or a real domain if you point one at
the instance's IP later — Let's Encrypt can issue for either, since it
just needs port 80 + DNS resolving to this box, both already true for the
AWS-assigned hostname). `EMAIL` is only sent to Let's Encrypt for expiry
notices.

This requests the cert, renders `nginx/ssl.conf.template` into
`nginx/conf.d/app.conf` (now serving 443 + redirecting 80→443), and
reloads nginx. The `certbot` service already running in the compose stack
handles renewal every 12h (a no-op until close to expiry).

Re-running `push-deploy.sh` after this point never overwrites
`nginx/conf.d/app.conf` on the server, so TLS stays in place across
redeploys.

## Sanity checks

```bash
curl http://<EC2_HOST>/
curl http://<EC2_HOST>/api/products
curl https://<EC2_HOST>/api/products   # after init-letsencrypt.sh
```

## Troubleshooting: 502 Bad Gateway on `/api/*`

nginx resolves `api` via Docker's embedded DNS (`resolver 127.0.0.11
valid=10s;` + a variable in `proxy_pass`, in both `nginx/bootstrap.conf`
and `nginx/ssl.conf.template`), so it re-resolves that hostname every ~10s
instead of caching the IP once at worker startup. If you ever see 502s
with `connect() failed (111: Connection refused)` in the nginx logs right
after a deploy, check that the live `nginx/conf.d/app.conf` on the server
actually has the `resolver` + `set $upstream_api` pattern — if not,
`docker compose restart nginx` fixes it immediately.
