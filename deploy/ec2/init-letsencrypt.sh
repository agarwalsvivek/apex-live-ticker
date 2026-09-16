#!/usr/bin/env bash
# Run ONCE on the EC2 box, from this directory (deploy/ec2), after the
# stack is already up on plain HTTP (docker compose up -d --build).
# Obtains a Let's Encrypt cert for $DOMAIN and switches nginx to serve TLS.
#
# Usage: DOMAIN=ec2-x-x-x-x.compute.amazonaws.com EMAIL=you@example.com ./init-letsencrypt.sh
set -euo pipefail

: "${DOMAIN:?Set DOMAIN, e.g. ec2-18-217-47-84.us-east-2.compute.amazonaws.com}"
: "${EMAIL:?Set EMAIL for Lets Encrypt expiry notices}"

cd "$(dirname "$0")"

echo "==> Requesting certificate for $DOMAIN"
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL --agree-tos --no-eff-email" certbot

echo "==> Rendering TLS nginx config"
export DOMAIN
envsubst '${DOMAIN}' < nginx/ssl.conf.template > nginx/conf.d/app.conf

echo "==> Reloading nginx"
docker compose exec nginx nginx -s reload

echo "==> Done. https://$DOMAIN should now be serving over TLS."
echo "    certbot's renew loop (already running as the 'certbot' service) will keep the cert current."
