FROM node:20-alpine

WORKDIR /app

# Copy package configs
COPY frontend/package*.json /app/

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ /app/

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
