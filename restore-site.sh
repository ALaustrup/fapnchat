#!/bin/bash
# WYA!? — Quick Site Restoration Script
# 
# Purpose: Restart PM2 process and verify site is online
# 
# Usage: ./restore-site.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/fapnchat"
WEB_DIR="$PROJECT_DIR/apps/web"
PM2_APP_NAME="fapnchat-web"
HEALTH_CHECK_URL="http://localhost:4000/api/health"

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

echo ""
echo "🚀 WYA!? — Site Restoration"
echo "=========================="
echo ""

# Change to web directory
cd "$WEB_DIR"

# Check if PM2 process exists
log_info "Checking PM2 process status..."
if pm2 list | grep -q "$PM2_APP_NAME"; then
  log_info "PM2 process found, restarting..."
  pm2 restart "$PM2_APP_NAME"
  log_success "PM2 process restarted"
else
  log_warning "PM2 process not found, starting new process..."
  cd "$PROJECT_DIR"
  pm2 start ecosystem.config.js
  log_success "PM2 process started"
fi

# Save PM2 configuration
log_info "Saving PM2 configuration..."
pm2 save
log_success "PM2 configuration saved"

# Wait for server to start
log_info "Waiting for server to start..."
sleep 5

# Check PM2 status
log_info "Checking PM2 status..."
pm2_status=$(pm2 jlist | jq -r ".[] | select(.name==\"$PM2_APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "unknown")
if [ "$pm2_status" = "online" ]; then
  log_success "PM2 process is online"
else
  log_error "PM2 process is not online (status: $pm2_status)"
  log_info "Recent logs:"
  pm2 logs "$PM2_APP_NAME" --lines 30 --nostream
  exit 1
fi

# Test health endpoint
log_info "Testing health endpoint..."
max_attempts=10
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
    log_success "Health check passed"
    health_response=$(curl -s "$HEALTH_CHECK_URL")
    echo ""
    echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"
    echo ""
    log_success "Site is back online! 🎉"
    exit 0
  fi
  
  attempt=$((attempt + 1))
  log_info "Waiting for server... ($attempt/$max_attempts)"
  sleep 2
done

log_error "Health check failed after $max_attempts attempts"
log_info "Recent PM2 logs:"
pm2 logs "$PM2_APP_NAME" --lines 30 --nostream
exit 1

