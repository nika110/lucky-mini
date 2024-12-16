FROM node:18-alpine

# Add development dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files (updated paths)
COPY backend/package*.json ./

# Install dependencies with all dev dependencies
RUN npm install

# Copy TypeScript config
COPY backend/tsconfig.json ./

# Copy source code (updated paths)
COPY backend/ .

# Expose ports
EXPOSE 5000
EXPOSE 50051

# Start the development server with hot-reloading
CMD ["npm", "run", "dev"]