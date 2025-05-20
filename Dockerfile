FROM node:22.15.1-bookworm-slim AS base

FROM base AS builder
WORKDIR /app

COPY . .

RUN npm install -g corepack@latest
RUN corepack enable
RUN pnpm i --ignore-scripts --frozen-lockfile
RUN pnpm build

FROM base AS runner

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .

RUN npm install -g corepack@latest
RUN corepack enable
RUN pnpm i --prod --ignore-scripts

ENV NODE_ENV=production
ENV NODE_OPTIONS=--disable-proto=delete

RUN apt-get update
RUN apt-get install dumb-init ffmpeg -y --no-install-recommends

EXPOSE 3000
VOLUME /config
VOLUME /data

USER node
CMD ["dumb-init", "node", "dist/main"]
