# Use Node.js 18 on Debian Bullseye (better for system dependencies than Alpine)
FROM node:18-bullseye

# Install system dependencies required for ID Card Scanner (zbar, tesseract, python3)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libzbar0 \
    tesseract-ocr \
    build-essential \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Create a virtual environment for Python dependencies
RUN python3 -m venv .venv
ENV PATH="/app/.venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir -r scripts/requirements-id-card.txt

# Build the Next.js application
# Note: Next.js build might require env vars. For production, these are often injected at build time.
# We set a dummy var to pass build if specific validation isn't strict, or you should pass --build-arg
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
