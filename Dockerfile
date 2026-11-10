FROM node:26-slim AS build

ARG APP_VERSION=%APP_VERSION%
ARG APP_TITLE=%APP_TITLE%
ARG APP_DESCRIPTION=%APP_DESCRIPTION%
ARG PUBLIC_URL=%PUBLIC_URL%
ARG REACT_APP_STAC_API=%REACT_APP_STAC_API%
ARG REACT_APP_STAC_BROWSER=%REACT_APP_STAC_BROWSER%
ARG REACT_APP_OIDC_AUTHORITY=%REACT_APP_OIDC_AUTHORITY%
ARG REACT_APP_OIDC_CLIENT_ID=%REACT_APP_OIDC_CLIENT_ID%
ARG REACT_APP_THEME_PRIMARY_COLOR=%REACT_APP_THEME_PRIMARY_COLOR%
ARG REACT_APP_THEME_SECONDARY_COLOR=%REACT_APP_THEME_SECONDARY_COLOR%

WORKDIR /app

COPY . .

RUN npm i
RUN npm run all:build

# The runtime image only serves static files: no Node.js, npm or node_modules.
FROM docker.io/nginx/nginx-unprivileged:1.31.8-alpine-slim@sha256:2f293597c9eea53645c61d70942d32b544a8007aeb586e0237e6ad637323b81b

WORKDIR /app

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Owned by the nginx user so docker-entrypoint.sh can fill in the placeholders at startup.
COPY --from=build --chown=nginx:nginx /app/packages/client/dist /app/packages/client/dist
COPY --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
