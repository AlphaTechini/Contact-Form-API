# --- Build Stage ---
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies using npm ci for faster, more reliable builds
RUN npm ci --only=production

# Copy the rest of the application code to the working directory
COPY . .

# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application from the builder stage
COPY --from=builder /app ./

# Set correct ownership
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port your app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]