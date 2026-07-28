# Stage 1: Build Frontend App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS runner

RUN apk add --no-cache gettext

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template and entrypoint for runtime backend URL injection
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV BACKEND_URL=backend:5001

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
