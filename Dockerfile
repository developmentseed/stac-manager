# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm i
RUN npm i -g http-server

RUN npm run plugins:build

RUN echo -e "npx nx reset\nnpm run client:build\nhttp-server -p 80 packages/client/dist" > ./start.sh
RUN chmod +x ./start.sh

EXPOSE 80

CMD ["sh", "./start.sh"]