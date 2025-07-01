# Use an official Node.js runtime as a parent image
FROM node:slim

# Define default values for environment variables
ARG APP_TITLE="STAC Manager"
ARG APP_DESCRIPTION="A web application for managing STAC catalogs"
ARG REACT_APP_STAC_API="https://earth-search.aws.element84.com/v0"
ARG PUBLIC_URL="http://127.0.0.1:8080"

ENV APP_TITLE=${APP_TITLE}
ENV APP_DESCRIPTION=${APP_DESCRIPTION}
ENV REACT_APP_STAC_API=${REACT_APP_STAC_API}
ENV PUBLIC_URL=${PUBLIC_URL}

# Set the working directory
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm i
RUN npm i -g http-server


# Create a start script that respects runtime environment variables
RUN echo '#!/bin/sh\n\
npm run all:build\n\
cp packages/client/dist/index.html packages/client/dist/404.html\n\
http-server -p 80 packages/client/dist' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 80

ENTRYPOINT ["/app/start.sh"]
