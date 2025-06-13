# Use an official Node.js runtime as a parent image
FROM node:slim

# Define default values for environment variables
ARG APP_TITLE="STAC Manager"
ARG APP_DESCRIPTION="A web application for managing STAC catalogs"
ARG REACT_APP_STAC_API=http://localhost:80
ARG PUBLIC_URL=/

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

RUN npm run all:build

EXPOSE 80

ENTRYPOINT ["http-server", "-p", "80", "packages/client/dist"]
