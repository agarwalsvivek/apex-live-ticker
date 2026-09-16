# Nx React Repository

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ A repository showcasing key [Nx](https://nx.dev) features for React monorepos ✨

🚀 If you haven't connected to Nx Cloud yet, [complete your setup here](https://cloud.nx.app/get-started). Get faster builds with remote caching, distributed task execution, and self-healing CI. [See how your workspace can benefit](#nx-cloud).

## 📦 Project Overview

This repository demonstrates a production-ready React monorepo with:

- **2 Applications**

  - `web` - React web application
  - `api` - Backend API serving product data

- **3 Libraries**

  - `@org/models` - Shared data models
  - `@org/api-products` - API product service library
  - `@org/shared-test-utils` - Shared testing utilities

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-fork-url>
cd <your-repository-name>

# Install dependencies
npm install

# Serve the React web application (this will simultaneously serve the API backend)
npx nx run @org/web:serve

# ...or you can serve the API separately
npx nx run @org/api:serve

# Build all projects
npx nx run-many -t build

# Run tests
npx nx run-many -t test

# Lint all projects
npx nx run-many -t lint

# Run tasks in parallel

npx nx run-many -t lint test build e2e --parallel=3

# Visualize the project graph
npx nx graph
```

## ☁️ Deploy to AWS EC2

The production deployment uses Nginx for the React frontend and PM2 for the
Express API. The API listens on port `3333` locally, while Nginx serves the
frontend and proxies `/api` requests to it.

### 1. Create the EC2 instance

Create an Ubuntu 24.04 LTS instance and configure its security group to allow:

- SSH (`22`) from your IP address only
- HTTP (`80`) from anywhere
- HTTPS (`443`) from anywhere

Keep port `3333` closed to the public internet.

### 2. Install the server dependencies

Connect to the instance over SSH:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

sudo apt update
sudo apt install -y git nginx curl

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 3. Clone and build the application

Replace `YOUR_REPOSITORY_URL` with the URL of this repository:

```bash
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

cd /var/www
git clone YOUR_REPOSITORY_URL apex-live-ticker
cd apex-live-ticker

npm ci
npm exec -- nx run-many -t build -p web api --outputStyle=static
```

The generated production files are:

```text
apps/web/dist
apps/api/dist/main.js
```

### 4. Run the API with PM2

```bash
pm2 start apps/api/dist/main.js --name apex-api
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`, then verify the API locally:

```bash
curl http://127.0.0.1:3333/
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/apex-live-ticker`:

```nginx
server {
  listen 80;
  server_name YOUR_DOMAIN_OR_EC2_IP;

  root /var/www/apex-live-ticker/apps/web/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/apex-live-ticker \
  /etc/nginx/sites-enabled/apex-live-ticker
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Open `http://YOUR_EC2_PUBLIC_IP` in a browser. Once a domain points to the
instance, use Certbot to add HTTPS.

### Updating the deployment

After pushing changes to the repository:

```bash
cd /var/www/apex-live-ticker
git pull
npm ci
npm exec -- nx run-many -t build -p web api --outputStyle=static
pm2 restart apex-api
sudo systemctl reload nginx
```

The current frontend does not make API requests yet. When adding them, use
relative URLs such as `/api/products` so Nginx can route them correctly.

## ⭐ Featured Nx Capabilities

This repository showcases several powerful Nx features:

### 1. 🔒 Module Boundaries

Enforces architectural constraints using tags. Each project has specific dependencies it can use:

- `scope:shared` - Can be used by all projects
- `scope:api` - API-specific libraries
- `type:feature` - Feature libraries
- `type:data` - Data access libraries
- `type:ui` - UI component libraries

**Try it out:**

```bash
# See the current project graph and boundaries
npx nx graph

# View a specific project's details
npx nx show project @org/web --web
```

[Learn more about module boundaries →](https://nx.dev/docs/features/enforce-module-boundaries)

### 2. ⚡ Vitest for Unit Testing

Fast unit testing with Vitest for React libraries:

```bash
# Test a specific library
npx nx run @org/models:test

# Test all projects
npx nx run-many -t test
```

[Learn more about Vite testing →](https://nx.dev/docs/technologies/build-tools/vite)

### 4. 🔧 Self-Healing CI

The CI pipeline includes `nx fix-ci` which automatically identifies and suggests fixes for common issues:

```bash
# In CI, this command provides automated fixes
npx nx fix-ci
```

This feature helps maintain a healthy CI pipeline by automatically detecting and suggesting solutions for:

- Missing dependencies
- Incorrect task configurations
- Cache invalidation issues
- Common build failures

[Learn more about self-healing CI →](https://nx.dev/docs/features/ci-features/self-healing-ci)

## 📁 Project Structure

```
├── apps/
│   ├── web/            [scope:web]     - React web application
│   └── api/            [scope:api]     - Backend API
├── packages/
│   ├── api/
│   │   └── products/    [scope:api]    - Product service
│   └── shared/
│       ├── models/      [scope:shared,type:data] - Shared models
│       └── test-utils/  [scope:shared]           - Testing utilities
├── nx.json             - Nx configuration
├── tsconfig.json       - TypeScript configuration
└── eslint.config.mjs   - ESLint with module boundary rules
```

## 🏷️ Understanding Tags

This repository uses tags to enforce module boundaries:

| Project  | Tags                        | Can Import From             |
| -------- | --------------------------- | --------------------------- |
| `web`    | `scope:web`                 | `scope:shared`              |
| `api`    | `scope:api`                 | `scope:api`, `scope:shared` |
| `models` | `scope:shared`, `type:data` | Nothing (base library)      |

## 📚 Useful Commands

```bash
# Project exploration
npx nx graph                                    # Interactive dependency graph
npx nx list                                     # List installed plugins
npx nx show project @org/web --web                   # View project details

# Development
npx nx run @org/web:serve                             # Serve React app
npx nx run @org/api:serve                               # Serve backend API
npx nx run @org/web:build                              # Build React app
npx nx run @org/models:test                             # Test a specific library

# Running multiple tasks
npx nx run-many -t build                       # Build all projects
npx nx run-many -t test --parallel=3          # Test in parallel
npx nx run-many -t lint test build            # Run multiple targets

# Affected commands (great for CI)
npx nx affected -t build                       # Build only affected projects
npx nx affected -t test                        # Test only affected projects
```

## 🎯 Adding New Features

### Generate a new React application:

```bash
npx nx g @nx/react:app my-app
```

### Generate a new React library:

```bash
npx nx g @nx/react:lib my-lib
```

### Generate a new React component:

```bash
npx nx g @nx/react:component my-component --project=my-lib
```

### Generate a new API library:

```bash
npx nx g @nx/node:lib my-api-lib
```

You can use `npx nx list` to see all available plugins and `npx nx list <plugin-name>` to see all generators for a specific plugin.

## Nx Cloud

Nx Cloud ensures a [fast and scalable CI](https://nx.dev/nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/docs/features/ci-features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/docs/features/ci-features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/docs/features/ci-features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/docs/features/ci-features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/docs/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

- [Nx Documentation](https://nx.dev/docs)
- [Crafting Your Workspace Tutorial](https://nx.dev/docs/getting-started/tutorials/crafting-your-workspace)
- [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)
- [Playwright Testing](https://nx.dev/docs/technologies/test-tools/playwright)
- [Vite](https://nx.dev/docs/technologies/build-tools/vite)
- [Docker Integration](https://nx.dev/docs/guides/nx-release/release-docker-images)
- [Nx Cloud](https://nx.dev/nx-cloud)

## 💬 Community

Join the Nx community:

- [Discord](https://go.nx.dev/community)
- [X (Twitter)](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)
