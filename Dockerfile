FROM node:slim

ARG APP_TITLE=%APP_TITLE%
ARG APP_DESCRIPTION=%APP_DESCRIPTION%
ARG PUBLIC_URL=%PUBLIC_URL%
ARG REACT_APP_STAC_API=%REACT_APP_STAC_API%
ARG REACT_APP_STAC_BROWSER=%REACT_APP_STAC_BROWSER%
ARG REACT_APP_KEYCLOAK_URL=%REACT_APP_KEYCLOAK_URL%
ARG REACT_APP_KEYCLOAK_CLIENT_ID=%REACT_APP_KEYCLOAK_CLIENT_ID%
ARG REACT_APP_KEYCLOAK_REALM=%REACT_APP_KEYCLOAK_REALM%
ARG REACT_APP_THEME_PRIMARY_COLOR=%REACT_APP_THEME_PRIMARY_COLOR%
ARG REACT_APP_THEME_SECONDARY_COLOR=%REACT_APP_THEME_SECONDARY_COLOR%

WORKDIR /app

COPY . .

RUN npm i
RUN npm i -g http-server
RUN npm run all:build
RUN cp -v packages/client/dist/index.html packages/client/dist/404.html

RUN apt-get update && apt-get install -y gettext-base sed

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["http-server", "-p", "80", "packages/client/dist"]
