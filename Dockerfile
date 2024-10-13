# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=22.9.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=.npmrc,target=.npmrc \
    --mount=type=bind,source=packages/interface/package.json,target=packages/interface/package.json \
    --mount=type=bind,source=packages/backend/package.json,target=packages/backend/package.json \
    --mount=type=bind,source=packages/frontend/package.json,target=packages/frontend/package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci -ws --include-workspace-root


# Copy the rest of the source files into the image.
COPY --link . .

RUN npm run build --ws

FROM node:${NODE_VERSION}-alpine AS production-base

WORKDIR /usr/src/app

# Use production node environment by default.
ENV NODE_ENV=production

COPY --link package.json package.json

# Copy shared interface package on all production images.
COPY --link ./packages/interface ./packages/interface
COPY --link --from=build /usr/src/app/packages/interface/dist ./packages/interface/dist

FROM production-base AS backend

RUN --mount=type=bind,source=packages/backend/package.json,target=packages/backend/package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci -w=backend --omit=dev

# Run the application as a non-root user.
USER node

COPY --link ./packages/backend ./packages/backend
COPY --link --from=build /usr/src/app/packages/backend/dist ./packages/backend/dist


ENV PORT=3000
EXPOSE 3000

# Run the application.
CMD ["node", "./packages/backend", "serve"]

FROM nginx:stable-alpine AS frontend
# This is temporary, you would just export the distribution and send it to a CDN as static assets
COPY --link --from=build /usr/src/app/packages/frontend/dist /usr/share/nginx/html
COPY --link ./packages/frontend/nginx/default.conf /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080
