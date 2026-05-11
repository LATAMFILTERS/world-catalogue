FROM node:20-alpine
WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install

# Install motor-de-busqueda dependencies and build Next.js
COPY motor-de-busqueda/package*.json ./motor-de-busqueda/
RUN cd motor-de-busqueda && npm install

# Copy the rest of the application
COPY . .

# Build Next.js
RUN cd motor-de-busqueda && npm run build

# Ensure start.sh is executable
RUN chmod +x start.sh

# Start both servers
CMD ["sh", "start.sh"]
