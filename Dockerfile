FROM node:20-alpine
WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install

# Install motor-de-busqueda dependencies
COPY motor-de-busqueda/package*.json ./motor-de-busqueda/
RUN cd motor-de-busqueda && npm install

# Copy the rest of the application
COPY . .

CMD ["node", "server.js"]
