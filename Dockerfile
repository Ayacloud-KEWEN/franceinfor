# syntax=docker/dockerfile:1
# FranceGo — multi-stage build producing a self-contained Next.js standalone
# image. Migration/scaling = build once, run anywhere with env. node:20-slim
# (Debian) keeps Prisma engines simple.

FROM node:20-slim AS deps
WORKDIR /app
# OpenSSL is needed by Prisma engines.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN useradd -m nextjs
# Next standalone output: server.js + traced node_modules.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Ensure the Prisma query engine ships with the image.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
