# This line defines which node.js 16-alpine for Docker image
FROM node:16-alpine

# Set working directory to app folder
WORKDIR /app

# Copy all files that service uses in container to 'app' folder
COPY . /app

# Install relevant dependencies
RUN npm i

# Starts the back end service
CMD ["node", "."]
