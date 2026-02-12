# Base dependencies
FROM node:18.19.0-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --silent && npm cache clean --force

# Test stage (for CI/CD)
FROM node:18.19.0-alpine AS test
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --silent && npm cache clean --force
COPY . .
RUN npm test

# Build stage
FROM deps AS builder
COPY . .
RUN npm run build

# Nginx stage
FROM nginx:1.27-alpine AS nginx
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
