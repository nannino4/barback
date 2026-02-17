# Build stage
FROM node:25-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Install ALL dependencies (needed for building TypeScript)
RUN npm ci --silent && \
    npm cache clean --force
COPY . .
RUN npm run build

# Test stage (for CI/CD)
FROM node:25-alpine AS test
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --silent && npm cache clean --force
COPY . .
ENV NODE_ENV=test
RUN npm test

# Production stage
FROM node:25-alpine AS prod
# Install security updates and utilities
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production --silent && \
    npm cache clean --force && \
    rm -rf /tmp/*
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
USER nodejs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
