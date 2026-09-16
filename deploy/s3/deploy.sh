#!/usr/bin/env bash
# Run from anywhere in the repo.
# Builds apps/web, syncs the static output to the S3 bucket, and
# invalidates the CloudFront distribution so the new build is served
# immediately instead of waiting out the cache TTL.
#
# Usage:
#   BUCKET_NAME=apex-live-ticker-web \
#   DISTRIBUTION_ID=E1234EXAMPLE \
#   ./deploy/s3/deploy-s3.sh
#
# Or set these once in deploy/s3/.env (gitignored) and run `npm run deploy:s3`.
set -euo pipefail

: "${BUCKET_NAME:?Set BUCKET_NAME to the S3 bucket name}"
: "${DISTRIBUTION_ID:?Set DISTRIBUTION_ID to the CloudFront distribution id}"
AWS_REGION="${AWS_REGION:-us-east-1}"

AWS_ARGS=(--region "$AWS_REGION")
if [ -n "${AWS_PROFILE:-}" ]; then
  AWS_ARGS+=(--profile "$AWS_PROFILE")
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "==> Building web"
npx nx build web

echo "==> Syncing apps/web/dist to s3://$BUCKET_NAME"
aws s3 sync apps/web/dist "s3://$BUCKET_NAME" --delete "${AWS_ARGS[@]}"

echo "==> Invalidating CloudFront cache"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  "${AWS_ARGS[@]}"

echo "==> Done."
echo "    Check https://${DOMAIN:-<your CloudFront/custom domain>}"
