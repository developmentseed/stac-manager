#!/bin/sh
set -e

echo "Startup script"
echo "Replacing environment variables in built files..."

# Replace placeholders with env vars or defaults only in the built files
find /app/packages/client/dist -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.map" -o -name "*.json" \) | xargs sed -i \
  -e "s|%APP_TITLE%|${APP_TITLE:-STAC Manager}|g" \
  -e "s|%APP_DESCRIPTION%|${APP_DESCRIPTION:-A web application for managing STAC catalogs}|g" \
  -e "s|%PUBLIC_URL%|${PUBLIC_URL:-http://127.0.0.1:8080}|g" \
  -e "s|%REACT_APP_STAC_API%|${REACT_APP_STAC_API:-https://earth-search.aws.element84.com/v0}|g" \
  -e "s|%REACT_APP_STAC_BROWSER%|${REACT_APP_STAC_BROWSER:-https://radiantearth.github.io/stac-browser/#/external/$(echo ${REACT_APP_STAC_API:-earth-search.aws.element84.com/v0} | sed 's|^https://||')}|g" \
  -e "s|%REACT_APP_KEYCLOAK_URL%|${REACT_APP_KEYCLOAK_URL:-}|g" \
  -e "s|%REACT_APP_KEYCLOAK_CLIENT_ID%|${REACT_APP_KEYCLOAK_CLIENT_ID:-}|g" \
  -e "s|%REACT_APP_KEYCLOAK_REALM%|${REACT_APP_KEYCLOAK_REALM:-}|g" \
  -e "s|%REACT_APP_THEME_PRIMARY_COLOR%|${REACT_APP_THEME_PRIMARY_COLOR:-#6A5ACD}|g" \
  -e "s|%REACT_APP_THEME_SECONDARY_COLOR%|${REACT_APP_THEME_SECONDARY_COLOR:-#048A81}|g"

echo "Environment variable replacement complete"

exec "$@"
