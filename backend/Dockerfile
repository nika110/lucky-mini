FROM node:18-alpine

# Add development dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with all dev dependencies
RUN npm install

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the development server with hot-reloading
CMD ["npm", "run", "dev"]