FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend and backend
RUN npm run build

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["npm", "start"]
