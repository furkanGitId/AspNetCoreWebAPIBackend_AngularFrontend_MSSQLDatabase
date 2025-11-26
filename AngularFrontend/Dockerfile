FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build the Angular app
COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled Angular assets
COPY --from=build /app/dist/my-app/browser/ ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

