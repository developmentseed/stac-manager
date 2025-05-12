# Use an official Node.js runtime as a parent image
FROM node:slim

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