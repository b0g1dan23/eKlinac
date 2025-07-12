# Use the official Bun image as base
FROM oven/bun:1.1.34-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies (if needed)
RUN apk add --no-cache curl

# Dependencies stage
FROM base AS deps

# Copy package files
COPY package.json bun.lockb* ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Development dependencies stage  
FROM base AS dev-deps

# Copy package files
COPY package.json bun.lockb* ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN bun install --frozen-lockfile

# Build stage
FROM dev-deps AS build

# Copy source code
COPY . .

# Copy environment variables for build (if needed)
# COPY .env.production .env

# Run build if you have a build step
# RUN bun run build

# Development stage
FROM dev-deps AS development

# Set environment variables for development
ENV NODE_ENV=development
ENV PORT=8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs || true
RUN adduser -S bun -u 1001 || true

# Copy source code
COPY --chown=bun:nodejs . .

# Switch to non-root user
USER bun

# Expose port
EXPOSE 8080

# Start the development server with hot reload
CMD ["bun", "run", "dev"]

# Production stage
FROM base AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs || true

# Copy all dependencies from dev-deps stage (including drizzle-kit)
COPY --from=dev-deps --chown=bun:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=bun:nodejs . .

# Copy built application (if you have a build step)
# COPY --from=build --chown=bun:nodejs /app/dist ./dist

# Switch to non-root user
USER bun

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["bun", "run", "start"]