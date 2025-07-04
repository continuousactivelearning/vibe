FROM node:20-alpine AS builder

# Install git and other build dependencies
RUN apk add --no-cache git python3 make g++ bash

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies)
RUN pnpm --filter frontend install --force

# Copy source code
COPY . .

RUN pnpm --filter frontend exec vite build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
