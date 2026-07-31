FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of your frontend code
COPY . .

# Expose the port your frontend runs on (usually 3000 or 5173 for Vite)
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
