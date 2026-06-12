FROM node:20-alpine

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install packages
RUN npm install

# Copy source tree
COPY . .

# Expose server port
EXPOSE 5000

# Start server in dev mode
CMD ["npm", "run", "dev"]
