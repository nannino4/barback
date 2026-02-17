# Base dependencies
FROM node:25-alpine AS deps
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --silent

# Build stage
FROM node:25-alpine AS builder
WORKDIR /usr/app
COPY package*.json ./
COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .
RUN npm run build

# Test stage (for CI/CD)
FROM node:25-alpine AS test
WORKDIR /usr/app
COPY package*.json ./
COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=test

# Production stage
FROM node:25-alpine AS prod
# Install security updates and utilities
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --only=production --silent && \
    npm cache clean --force && \
    rm -rf /tmp/*
COPY --from=builder --chown=nodejs:nodejs /usr/app/dist ./dist
USER nodejs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
