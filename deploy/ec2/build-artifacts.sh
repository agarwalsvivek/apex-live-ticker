#!/usr/bin/env bash
# Run from anywhere in the repo. Builds the web app's static assets so the
# EC2 nginx service can serve them directly from a bind mount. The api
# image builds itself from source during `docker compose up --build` on
# the server, so it needs no local build step here.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "==> Building web"
npx nx build web

echo "==> Done. Artifacts:"
echo "    apps/web/dist"
