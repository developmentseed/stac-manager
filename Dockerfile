FROM node:slim

ARG APP_TITLE=%APP_TITLE%
ARG APP_DESCRIPTION=%APP_DESCRIPTION%
ARG REACT_APP_STAC_API=%REACT_APP_STAC_API%
ARG REACT_APP_STAC_BROWSER=%REACT_APP_STAC_BROWSER%
ARG REACT_APP_KEYCLOAK_URL=%REACT_APP_KEYCLOAK_URL%
ARG REACT_APP_KEYCLOAK_CLIENT_ID=%REACT_APP_KEYCLOAK_CLIENT_ID%
ARG REACT_APP_KEYCLOAK_REALM=%REACT_APP_KEYCLOAK_REALM%
ARG REACT_APP_THEME_PRIMARY_COLOR=%REACT_APP_THEME_PRIMARY_COLOR%
ARG REACT_APP_THEME_SECONDARY_COLOR=%REACT_APP_THEME_SECONDARY_COLOR%

# Build with / as PUBLIC_URL so Parcel can resolve paths, then replace with placeholder
ENV PUBLIC_URL=/

WORKDIR /app

COPY . .

RUN npm i
RUN npm i -g http-server
RUN npm run all:build
RUN cp -v packages/client/dist/index.html packages/client/dist/404.html

# Replace build-time paths with runtime placeholders for entrypoint script
RUN find /app/packages/client/dist -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.webmanifest" \) -exec sed -i \
    -e 's|webmanifest://|%PUBLIC_URL%/|g' \
    -e 's|"//meta/|"%PUBLIC_URL%/meta/|g' \
    -e 's|"/meta/|"%PUBLIC_URL%/meta/|g' \
    -e 's|href="/|href="%PUBLIC_URL%/|g' \
    -e 's|src="/|src="%PUBLIC_URL%/|g' \
    {} +

RUN apt-get update && apt-get install -y gettext-base sed && \
    rm -rf /var/lib/apt/lists/*

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown -R node:node /app

USER node

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["http-server", "-p", "8080", "packages/client/dist"]
