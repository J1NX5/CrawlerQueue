# Stage 1: Build the application
FROM node:18-alpine AS builder
# Create app directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application
COPY . .
# Build the TypeScript code
RUN npm run build


# Stage 2: Create the production image
FROM node:18-alpine
# Create app directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install only production dependencies
RUN npm install --production
# Copy the build files from the builder stage
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
# Command to run the app
CMD ["node", "dist/index.js"]