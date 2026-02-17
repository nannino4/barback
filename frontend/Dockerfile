# Base dependencies
FROM node:25-alpine AS deps
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --silent && npm cache clean --force

# Test stage (for CI/CD)
FROM node:25-alpine AS test
WORKDIR /usr/app
COPY package*.json ./
COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .
RUN npm test

# Build stage
FROM deps AS builder
COPY . .
RUN npm run build

# Nginx stage
FROM nginx:1.29-alpine AS nginx
COPY --from=builder /usr/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
