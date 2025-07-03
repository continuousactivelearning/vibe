FROM node:20-alpine AS builder

RUN apk add --no-cache git

RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm copy
RUN pnpm build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
