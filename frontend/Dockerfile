# Base dependencies
FROM node:25-alpine AS deps
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --silent

# Build stage
FROM deps AS builder
ARG VITE_BUILD_MODE=production
COPY . .
RUN npm run build -- --mode ${VITE_BUILD_MODE}

# Nginx stage
FROM nginx:1.29-alpine AS nginx
COPY --from=builder /usr/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
