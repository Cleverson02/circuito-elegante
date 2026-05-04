FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Skip prepare lifecycle scripts (husky) in CI/Docker
ENV CI=true

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Copy non-TypeScript assets (markdown, etc)
RUN cp -r backend/src/prompts dist/backend/src/ 2>/dev/null || true

# Expose port
EXPOSE 3005

# Start server
CMD ["node", "dist/backend/src/server.js"]
