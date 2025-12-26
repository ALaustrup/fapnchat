#!/bin/bash
# Deployment script for FapNChat

set -e

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
cd apps/web
npm install
npm run build

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the build output to your server"
echo "2. Set up environment variables on the server"
echo "3. Install Node.js dependencies on the server"
echo "4. Start the application with: npm start"
echo "5. Configure reverse proxy (nginx/caddy) to point to port 3000"

