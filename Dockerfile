FROM node:22-alpine

# Set working directory
WORKDIR /app

# Enable Corepack and configure PNPM
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server bound to all network interfaces (0.0.0.0)
CMD ["pnpm", "dev", "--host"]
