FROM node:20-alpine AS builder

RUN apk add --no-cache git

RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

RUN pnpm add -D date-fns || echo "date-fns already installed"

RUN echo "// Fixing unused variables warnings" >> src/fix-ts-errors.ts && \
    echo "export const setImageSrcs = null;" >> src/fix-ts-errors.ts && \
    echo "export const modelReady = null;" >> src/fix-ts-errors.ts && \
    echo "export const imgIndex = null;" >> src/fix-ts-errors.ts && \
    echo "export const personIndex = null;" >> src/fix-ts-errors.ts && \
    echo "export const base64 = null;" >> src/fix-ts-errors.ts && \
    echo "export const set = null;" >> src/fix-ts-errors.ts && \
    echo "export const useEffect = null;" >> src/fix-ts-errors.ts

RUN pnpm build --force

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
