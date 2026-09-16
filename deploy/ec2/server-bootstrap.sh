#!/usr/bin/env bash
# Run ONCE on a fresh Ubuntu EC2 instance (via ssh) to install Docker.
# Safe to re-run.
set -euo pipefail

if ! command -v docker >/dev/null; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

echo "==> Installing gettext-base (envsubst, used by init-letsencrypt.sh)"
sudo apt-get update -y
sudo apt-get install -y gettext-base

echo "==> Docker version:"
docker --version
docker compose version

echo
echo "If this is your first time installing Docker, log out and back in"
echo "(or run 'newgrp docker') so your user picks up the docker group."
