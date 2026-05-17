FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN PUPPETEER_SKIP_DOWNLOAD=true npm install
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
