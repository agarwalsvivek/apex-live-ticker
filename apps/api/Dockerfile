FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json nx.json tsconfig.json tsconfig.base.json ./
COPY apps ./apps
RUN npm ci
RUN npx nx build api --configuration=production

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
# esbuild bundles all workspace code into main.js; express is the only
# dependency left unbundled, so it's the only thing installed here.
RUN npm install --no-save --omit=dev express@4.21.2
COPY --from=builder /app/apps/api/dist/main.js ./main.js
EXPOSE 3333
CMD ["node", "main.js"]
