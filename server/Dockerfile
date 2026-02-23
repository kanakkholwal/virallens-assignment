# Stage 1: Build
FROM oven/bun:1-alpine AS builder

# Set working directory
WORKDIR /virallens-server

# Install dependencies first for caching
COPY package.json ./
RUN bun install
# Copy source files and build TypeScript
COPY . .
RUN bun run build

# Stage 2: Production
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /virallens-server

# Copy only necessary files for production
COPY package.json ./
COPY --from=builder /virallens-server/node_modules ./node_modules
COPY --from=builder /virallens-server/dist ./dist

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0


# Expose port (match your app's port)
EXPOSE 8080 

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Health check
# HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
#   CMD curl --fail http://localhost:8080 || exit 1

# Command to run the application
CMD ["bun", "run", "start"]

