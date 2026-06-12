FROM node:20-alpine

WORKDIR /app

# Copy dependency configurations
COPY package*.json ./

# Install packages
RUN npm install

# Copy source assets
COPY . .

# Expose Vite port
EXPOSE 3000

# Start Vite server bound to port 3000 on all network interfaces
CMD ["npm", "run", "dev", "--", "--port", "3000", "--host"]
