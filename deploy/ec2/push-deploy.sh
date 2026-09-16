#!/usr/bin/env bash
# Run from anywhere in the repo, after build-artifacts.sh.
# Rsyncs the source the api needs to build its own image on the server,
# the prebuilt web assets, and deploy/ec2 config, then brings the stack up.
#
# Usage:
#   EC2_HOST=ec2-18-217-47-84.us-east-2.compute.amazonaws.com \
#   EC2_KEY=~/.ssh/my-key-pair.pem \
#   ./deploy/ec2/push-deploy.sh
set -euo pipefail

EC2_USER="${EC2_USER:-ubuntu}"
: "${EC2_HOST:?Set EC2_HOST to the instance public DNS or IP}"
: "${EC2_KEY:?Set EC2_KEY to the path of the .pem key}"
REMOTE_DIR="${REMOTE_DIR:-~/apex-live-ticker}"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

SSH_OPTS=(-i "$EC2_KEY" -o StrictHostKeyChecking=accept-new)

echo "==> Ensuring remote directory exists"
ssh "${SSH_OPTS[@]}" "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_DIR"

echo "==> Syncing source + artifacts"
# Once init-letsencrypt.sh has switched nginx/conf.d/app.conf to the
# TLS-rendered config on the server, we don't want redeploys to clobber it
# back to the checked-in HTTP-only bootstrap version — but only then.
# Before that (including the very first deploy), app.conf should sync
# normally so it actually reaches the server in the first place and stays
# in sync with any later edits to the checked-in bootstrap config.
RSYNC_EXTRA_EXCLUDES=()
if ssh "${SSH_OPTS[@]}" "$EC2_USER@$EC2_HOST" \
    "grep -q ssl_certificate $REMOTE_DIR/deploy/ec2/nginx/conf.d/app.conf 2>/dev/null"; then
  echo "    (TLS already active on server — leaving nginx/conf.d/app.conf untouched)"
  RSYNC_EXTRA_EXCLUDES=(--exclude 'nginx/conf.d/app.conf')
fi

rsync -az --relative -e "ssh ${SSH_OPTS[*]}" \
  --exclude 'node_modules' --exclude '**/node_modules' \
  --exclude 'apps/api/dist' \
  --exclude '.git' --exclude '.nx' \
  "${RSYNC_EXTRA_EXCLUDES[@]}" \
  package.json package-lock.json nx.json tsconfig.json tsconfig.base.json \
  apps \
  deploy/ec2 \
  "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"

echo "==> Bringing up the stack"
ssh "${SSH_OPTS[@]}" "$EC2_USER@$EC2_HOST" \
  "cd $REMOTE_DIR/deploy/ec2 && docker compose up -d --build --remove-orphans"

echo "==> Reloading nginx"
# docker compose up only recreates a container when its service definition
# changes — it never notices that a bind-mounted file's *contents* changed.
# nginx reads its config once at startup, so without an explicit reload
# here, a deploy that only touches nginx/conf.d or the ssl templates would
# sync the new file to disk but leave the running nginx process serving
# the old config until it's told to reload (or is restarted).
ssh "${SSH_OPTS[@]}" "$EC2_USER@$EC2_HOST" \
  "cd $REMOTE_DIR/deploy/ec2 && docker compose exec nginx nginx -s reload"

echo "==> Done. Check http://$EC2_HOST"
echo "    First time only: run init-letsencrypt.sh on the server for HTTPS (see deploy/ec2/README.md)."
