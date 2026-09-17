# syntax=docker/dockerfile:1

# ---- build -------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/style/package.json packages/style/
RUN pnpm install --frozen-lockfile --filter @mappa/web...

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY packages/style packages/style
COPY apps/web apps/web

ARG VITE_APP_NAME=Mappa
ARG VITE_API_BASE=
ARG VITE_TILE_BASE=http://localhost:8081
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_API_BASE=$VITE_API_BASE \
    VITE_TILE_BASE=$VITE_TILE_BASE

RUN pnpm --filter @mappa/web run build

# ---- runtime -----------------------------------------------------------------
FROM caddy:2.10-alpine AS runtime
COPY --from=build /app/apps/web/dist /srv
EXPOSE 80
