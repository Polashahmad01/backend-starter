# Multi-stage build for production optimization
# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage
FROM node:22-alpine AS production

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any additional files needed at runtime (if any)
COPY --from=builder /app/.env.example ./.env.example

# Change ownership to non-root user
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port (default to 8080 for Cloud Run compatibility)
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: process.env.PORT || 8080, path: '/api/v1/health', timeout: 2000 }; \
    const request = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    request.on('error', () => process.exit(1)); \
    request.end();"

# Start the application
CMD ["node", "dist/index.js"]
