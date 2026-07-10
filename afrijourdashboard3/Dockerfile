# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --force
COPY . .
RUN npm run build

# Stage 2: Serve with nginx (SPA fallback + backend proxy).
# Using nginx instead of `serve` so the same origin can proxy Django endpoints,
# which avoids Chrome-mobile's HTTPS-upgrade blocking cross-origin HTTP fetches.
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
