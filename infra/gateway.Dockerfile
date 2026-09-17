# syntax=docker/dockerfile:1

# ---- build -------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

# Copy only what the install needs first, so the dependency layer caches.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/gateway/package.json apps/gateway/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @mappa/gateway...

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/gateway apps/gateway

RUN pnpm --filter @mappa/gateway run build

# Re-resolve to production dependencies only.
RUN pnpm --filter @mappa/gateway --prod deploy /deploy

# ---- runtime -----------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup -S mappa && adduser -S mappa -G mappa

COPY --from=build /deploy/node_modules ./node_modules
COPY --from=build /app/apps/gateway/dist ./dist

USER mappa
EXPOSE 8080
CMD ["node", "dist/index.js"]
