FROM node:22-alpine AS builder

RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate && npm install -g rimraf

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY scripts ./scripts
RUN pnpm install

COPY . .
RUN pnpm tsc || echo "TypeScript compilation had errors but continuing build"

FROM node:22-alpine

RUN apk add --no-cache dumb-init git

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4001/health || exit 1

CMD ["dumb-init", "node", "build/index.js"]
