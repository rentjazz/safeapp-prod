# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

# Copy source and force rebuild
COPY . .
RUN rm -rf build && npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Simple nginx config
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]