#!/bin/bash
# Server setup script for FapNChat deployment

set -e

echo "🚀 Setting up FapNChat server..."

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
apt-get update
apt-get install -y nginx

# Install git if not present
apt-get install -y git

# Create application directory
mkdir -p /var/www/fapnchat
cd /var/www/fapnchat

# Clone repository if not exists
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/ALaustrup/fapnchat.git .
else
    echo "🔄 Pulling latest changes..."
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/web
npm install --legacy-peer-deps

# Build application
echo "🔨 Building application..."
npm run build

echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in /var/www/fapnchat/apps/web/.env"
echo "2. Configure nginx reverse proxy"
echo "3. Start the application with PM2: pm2 start npm --name fapnchat -- start"
echo "4. Save PM2 configuration: pm2 save"
echo "5. Set PM2 to start on boot: pm2 startup"

