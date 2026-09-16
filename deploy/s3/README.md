# S3 + CloudFront deploy (web only)

Serves `apps/web`'s static build from S3 behind CloudFront, as an
alternative to the nginx-served copy in [`deploy/ec2`](../ec2/README.md).
The two are independent — this doesn't touch the EC2 stack. The `api`
still runs on EC2; the browser will call it cross-origin, which already
works today since `apps/api` sends `Access-Control-Allow-Origin: *`
(see `apps/api/src/main.ts`). `apps/web` doesn't make any API calls yet —
when it does, point it at the EC2 host's URL directly (there's no
same-origin `/api/*` proxy in this setup, unlike the EC2 nginx one).

Bucket: `apex-live-ticker` (`us-east-1`)
Domain: `live-ticker.agarwalsvivek.com` (DNS hosted outside AWS, in Cloudflare)
Distribution: `E2Y2U1G3K8OY4O` (`d2e6wntu74q83b.cloudfront.net`)

## One-time setup

### 1. ACM certificate

CloudFront only accepts certs from `us-east-1`, regardless of where the
distribution or bucket live — works out here since the bucket is already
in `us-east-1`.

```bash
aws acm request-certificate \
  --domain-name live-ticker.agarwalsvivek.com \
  --validation-method DNS \
  --region us-east-1
```

Then:

```bash
aws acm describe-certificate \
  --certificate-arn <ARN from above> \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
```

Add the returned CNAME (`Name` → `Value`) at your DNS provider (since DNS
isn't in Route53, this is a manual step there). Wait for
`aws acm describe-certificate ... --query 'Certificate.Status'` to report
`ISSUED` before continuing — CloudFront creation will fail on a pending
cert.

### 2. Bucket: keep it private

The bucket should have Block Public Access fully on (default for new
buckets). CloudFront reaches it via Origin Access Control (OAC), so it
never needs to be public. No static-website-hosting mode either — that's
for the direct-public-access pattern, not this one.

### 3. CloudFront distribution

Easiest via the console (S3 origin picker sets up OAC automatically):

1. CloudFront → Create distribution.
2. Origin domain: pick the `apex-live-ticker-web` bucket from the list →
   accept the prompt to create a new OAC.
3. Viewer protocol policy: Redirect HTTP to HTTPS.
4. Alternate domain name (CNAME): `apex-live-ticker.agarwalsvivek.com`.
5. Custom SSL certificate: the ACM cert from step 1.
6. Default root object: `index.html`.
7. **Custom error responses** (needed — `apps/web` uses client-side
   routing via `react-router-dom`, and S3/OAC returns 403 for any path
   that isn't a literal object key):
   - HTTP error code `403` → Response page path `/index.html` → Response
     code `200`.
   - HTTP error code `404` → Response page path `/index.html` → Response
     code `200`.
8. Create. Note the distribution's **Id** and its `*.cloudfront.net`
   domain — you'll need the Id for `deploy/s3/.env` below.

After creating it, CloudFront shows a banner to update the bucket policy
— accept that (or apply `deploy/s3/bucket-policy.template.json` yourself,
filling in `${BUCKET_NAME}`, `${ACCOUNT_ID}`, `${DISTRIBUTION_ID}`):

```bash
aws s3api put-bucket-policy \
  --bucket apex-live-ticker-web \
  --policy file://deploy/s3/bucket-policy.json  # your filled-in copy, gitignored
```

### 4. DNS

At your DNS provider, point the domain at the distribution:

```
apex-live-ticker.agarwalsvivek.com  CNAME  <distribution-id>.cloudfront.net
```

(A plain CNAME is fine for a subdomain; if this were a bare apex domain
you'd need your provider's ALIAS/ANAME equivalent instead.)

### 5. Local config

```bash
cat > deploy/s3/.env <<'EOF'
BUCKET_NAME=apex-live-ticker-web
DISTRIBUTION_ID=<from step 3>
AWS_REGION=us-east-1
DOMAIN=apex-live-ticker.agarwalsvivek.com
# AWS_PROFILE=your-profile   # uncomment if not using the default profile
EOF
```

This file is gitignored (matches the same `.env` rule as `deploy/ec2/.env`).

## Every deploy

```bash
npm run deploy:s3
```

Reads `deploy/s3/.env`, builds `apps/web`, syncs `apps/web/dist` to the
bucket (`--delete`, so removed files don't linger), and invalidates the
CloudFront cache so the change is live immediately.

## Sanity checks

```bash
curl -I https://apex-live-ticker.agarwalsvivek.com/
curl -I https://apex-live-ticker.agarwalsvivek.com/some/client-route   # should 200, not 403/404 — confirms the SPA fallback
```
