# Use Debian-based slim image to avoid Alpine binary compatibility issues
# with the native modules bundled in @anthropic-ai/claude-agent-sdk
FROM node:20-slim

# Install system dependencies required by the SDK's bundled Claude Code binary
# and by the Developer agent's Bash tool (git, curl for npx, python3/make/g++ for native modules)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    bash \
    curl \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for tsx)
RUN npm ci

# Copy TypeScript config and source
COPY tsconfig.json ./
COPY src/ ./src/

# Create the workspace directory (overridden by the Docker volume mount at runtime)
RUN mkdir -p /workspace

# Environment defaults (override via docker-compose.yml or -e flags)
ENV NODE_ENV=production \
    WORKSPACE_DIR=/workspace

# Run via tsx so we don't need a separate build step
CMD ["node", "--import", "tsx/esm", "src/index.ts"]
