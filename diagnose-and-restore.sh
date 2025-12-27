#!/bin/bash
# WYA!? — Site Diagnostic and Recovery Script
# 
# Purpose: Diagnose why site is down and restore it
# 
# Usage: ./diagnose-and-restore.sh

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
echo "🔍 WYA!? — Site Diagnostic"
echo "=========================="
echo ""

# 1. Check PM2 status
log_info "Checking PM2 status..."
if command -v pm2 &> /dev/null; then
  pm2 status
  echo ""
  
  if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2_status=$(pm2 jlist | jq -r ".[] | select(.name==\"$PM2_APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "unknown")
    log_info "PM2 process status: $pm2_status"
    
    if [ "$pm2_status" != "online" ]; then
      log_warning "PM2 process is not online (status: $pm2_status)"
      log_info "Recent logs:"
      pm2 logs "$PM2_APP_NAME" --lines 30 --nostream
    else
      log_success "PM2 process is online"
    fi
  else
    log_error "PM2 process '$PM2_APP_NAME' not found"
  fi
else
  log_error "PM2 not installed or not in PATH"
fi

echo ""

# 2. Check if build exists
log_info "Checking build directory..."
if [ -d "$WEB_DIR/build" ]; then
  build_size=$(du -sh "$WEB_DIR/build" | cut -f1)
  log_success "Build directory exists ($build_size)"
  
  if [ -f "$WEB_DIR/build/server/index.js" ]; then
    log_success "Server entry point exists"
  else
    log_error "Server entry point missing: build/server/index.js"
  fi
else
  log_error "Build directory not found: $WEB_DIR/build"
fi

echo ""

# 3. Check environment variables
log_info "Checking environment variables..."
if [ -f "$WEB_DIR/.env" ]; then
  log_success ".env file exists"
  
  # Check critical vars
  cd "$WEB_DIR"
  set +e
  source .env 2>/dev/null || true
  set -e
  
  if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL not set"
  else
    log_success "DATABASE_URL is set"
  fi
  
  if [ -z "$AUTH_SECRET" ]; then
    log_error "AUTH_SECRET not set"
  else
    log_success "AUTH_SECRET is set"
  fi
  
  if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    log_error "NEXT_PUBLIC_APP_URL not set"
  else
    log_success "NEXT_PUBLIC_APP_URL is set"
  fi
else
  log_error ".env file not found: $WEB_DIR/.env"
fi

echo ""

# 4. Test health endpoint
log_info "Testing health endpoint..."
if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
  health_response=$(curl -s "$HEALTH_CHECK_URL")
  log_success "Health check passed"
  echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"
else
  log_error "Health check failed - server not responding"
fi

echo ""

# 5. Check port availability
log_info "Checking if port 4000 is in use..."
if lsof -i :4000 &> /dev/null || netstat -tuln | grep -q ":4000 "; then
  log_success "Port 4000 is in use"
else
  log_warning "Port 4000 is not in use - server may not be running"
fi

echo ""

# 6. Check recent errors
log_info "Checking recent errors..."
if [ -f "/var/log/fapnchat/error.log" ]; then
  error_count=$(tail -n 100 "/var/log/fapnchat/error.log" | grep -i "error\|failed\|exception" | wc -l)
  log_info "Recent errors in log: $error_count"
  if [ "$error_count" -gt 0 ]; then
    log_warning "Recent errors found:"
    tail -n 20 "/var/log/fapnchat/error.log" | grep -i "error\|failed\|exception" | tail -n 5
  fi
else
  log_warning "Error log not found"
fi

echo ""
echo "📋 Recovery Steps:"
echo "=================="
echo ""
echo "If PM2 process is not running:"
echo "  cd $WEB_DIR"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "If build is missing:"
echo "  cd $WEB_DIR"
echo "  npm run build"
echo ""
echo "If environment variables are missing:"
echo "  cd $WEB_DIR"
echo "  nano .env  # Edit and add required variables"
echo ""
echo "To restart everything:"
echo "  cd $PROJECT_DIR"
echo "  ./deploy-alpha.sh"
echo ""

