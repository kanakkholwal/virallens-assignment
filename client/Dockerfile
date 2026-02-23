# Stage 1: Build
FROM oven/bun:1-alpine AS builder

# Set working directory
WORKDIR /virallens-client

# Install dependencies first for caching
COPY package.json ./
RUN bun install
# Copy source files and build TypeScript
COPY . .
RUN bun run build

# Final production stage
FROM oven/bun:1
WORKDIR /virallens-client
COPY --from=builder /virallens-client/package.json .
COPY --from=builder /virallens-client/dist ./dist
RUN bun install vite --production
EXPOSE 4173
CMD ["bun", "run", "preview"]
