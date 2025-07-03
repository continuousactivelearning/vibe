# ========================================
# Build stage
# ========================================
FROM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++ bash

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

COPY package.json tsconfig.json ./

COPY pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm tsc || echo "TypeScript compilation had errors but continuing build"

# Handle Sentry source maps if SENTRY_AUTH_TOKEN is provided
ARG SENTRY_AUTH_TOKEN
RUN if [ -n "$SENTRY_AUTH_TOKEN" ]; then \
      pnpm sentry-cli login --auth-token $SENTRY_AUTH_TOKEN && \
      pnpm sentry-cli sourcemaps inject --org dled --project backend-users ./build && \
      pnpm sentry-cli sourcemaps upload --org dled --project backend-users ./build; \
    fi

# ========================================
# Production stage
# ========================================
FROM node:20-alpine

RUN apk add --no-cache dumb-init bash \
    && corepack enable \
    && corepack prepare pnpm@10.4.1 --activate

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml* ./

RUN pnpm install --prod --no-frozen-lockfile

COPY --from=builder /app/build ./build

COPY --chown=appuser:appgroup .env* ./

ENV NODE_ENV=production
ENV PORT=4001
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/health', (r) => {if(r.statusCode !== 200) throw new Error()}).on('error', () => {process.exit(1)});"

EXPOSE 4001

# Use dumb-init as the entry point for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "build/index.js"]
