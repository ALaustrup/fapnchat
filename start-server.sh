#!/bin/bash
cd /var/www/fapnchat/apps/web

# Load environment variables from .env file
set -a
[ -f .env ] && source .env
set +a

# Set production mode and port
export NODE_ENV=production
export PORT=${PORT:-4000}

# Start the server using custom server wrapper
exec node server.js

