# Use Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose gRPC port
EXPOSE 50051

# Start the gRPC server
CMD ["npm", "run", "start"]
