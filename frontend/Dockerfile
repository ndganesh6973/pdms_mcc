FROM node:20-alpine

WORKDIR /app

# Install dependencies based on your package.json
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Start Vite with the --host flag so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]