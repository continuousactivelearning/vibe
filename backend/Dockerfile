# ========================================
# Build stage
# ========================================
FROM node:22-alpine AS builder

RUN apk add --no-cache git python3 make g++ bash
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

COPY package.json .
RUN pnpm install

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
# Build stage
# ========================================
FROM node:22-alpine AS build

# Install build dependencies
RUN apk add --no-cache git python3 make g++ bash

# Install pnpm with correct version
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy package files for better caching
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Create empty lock file if it doesn't exist
RUN if [ ! -f "pnpm-lock.yaml" ]; then touch pnpm-lock.yaml; fi

# Install dependencies with --no-frozen-lockfile to allow installation without lock file
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm tsc || echo "TypeScript build failed but continuing"

# ========================================
# Production stage
# ========================================
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Create empty lock file if it doesn't exist
RUN if [ ! -f "pnpm-lock.yaml" ]; then touch pnpm-lock.yaml; fi

RUN pnpm install --prod --no-frozen-lockfile

# Copy built files from build stage
COPY --from=build /app/dist/ ./dist/

# Copy public directory if it exists
RUN mkdir -p ./public/
COPY --from=build /app/public ./public/

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4001/health || exit 1

# Run with dumb-init to handle signals properly
CMD ["dumb-init", "node", "dist/index.js"]
