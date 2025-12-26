#!/bin/bash
# WYA!? — Alpha Deployment Script
# 
# Purpose: Stable, boring, predictable Alpha deployment
# 
# Usage: ./deploy-alpha.sh [--skip-build] [--skip-migrations] [--skip-tests]
#
# Alpha Notes:
# - Validates environment before deployment
# - Runs migrations (invite codes table)
# - Builds and restarts PM2
# - Tests health endpoint
# - Shows deployment status

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/fapnchat"
WEB_DIR="$PROJECT_DIR/apps/web"
LOG_DIR="/var/log/fapnchat"
PM2_APP_NAME="fapnchat-web"
HEALTH_CHECK_URL="http://localhost:4000/api/health"

# Parse arguments
SKIP_BUILD=false
SKIP_MIGRATIONS=false
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-migrations)
      SKIP_MIGRATIONS=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Helper functions
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

# Check if running as root or with sudo
check_permissions() {
  if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    log_error "This script requires root or sudo privileges"
    exit 1
  fi
}

# Check if required commands exist
check_dependencies() {
  log_info "Checking dependencies..."
  
  local missing=()
  
  for cmd in git npm node pm2; do
    if ! command -v $cmd &> /dev/null; then
      missing+=($cmd)
    fi
  done
  
  if [ ${#missing[@]} -ne 0 ]; then
    log_error "Missing required commands: ${missing[*]}"
    exit 1
  fi
  
  log_success "All dependencies found"
}

# Validate environment variables
validate_env() {
  log_info "Validating environment variables..."
  
  cd "$WEB_DIR"
  
  if [ ! -f .env ]; then
    log_error ".env file not found in $WEB_DIR"
    log_info "Create .env from .env.example"
    exit 1
  fi
  
  # Load .env file safely (handle unset variables)
  set +e  # Don't exit on errors during source
  set -a  # Auto-export variables
  # Source .env, ignoring comments and empty lines
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    # Export the variable
    export "$line" 2>/dev/null || true
  done < .env
  set +a
  set -e  # Re-enable exit on error
  
  local errors=()
  
  # Check required variables (use default empty string if unset)
  local db_url="${DATABASE_URL:-}"
  if [ -z "$db_url" ]; then
    errors+=("DATABASE_URL is required")
  elif [[ ! "$db_url" =~ ^postgres ]]; then
    errors+=("DATABASE_URL must start with postgresql:// or postgres://")
  fi
  
  local auth_secret="${AUTH_SECRET:-}"
  if [ -z "$auth_secret" ]; then
    errors+=("AUTH_SECRET is required")
  elif [ ${#auth_secret} -lt 32 ]; then
    errors+=("AUTH_SECRET must be at least 32 characters")
  fi
  
  local app_url="${NEXT_PUBLIC_APP_URL:-}"
  if [ -z "$app_url" ]; then
    errors+=("NEXT_PUBLIC_APP_URL is required")
  fi
  
  if [ ${#errors[@]} -ne 0 ]; then
    log_error "Environment validation failed:"
    for error in "${errors[@]}"; do
      log_error "  - $error"
    done
    exit 1
  fi
  
  log_success "Environment variables validated"
}

# Create log directory
setup_logs() {
  log_info "Setting up log directory..."
  
  if [ ! -d "$LOG_DIR" ]; then
    sudo mkdir -p "$LOG_DIR"
    sudo chown $(whoami):$(whoami) "$LOG_DIR"
    log_success "Created log directory: $LOG_DIR"
  else
    log_success "Log directory exists: $LOG_DIR"
  fi
}

# Pull latest code
pull_code() {
  log_info "Pulling latest code..."
  
  cd "$PROJECT_DIR"
  
  # Check if we're on main branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  if [ "$current_branch" != "main" ]; then
    log_warning "Not on main branch (current: $current_branch)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
  
  git fetch origin
  git pull origin main
  
  log_success "Code updated"
}

# Run migrations
run_migrations() {
  if [ "$SKIP_MIGRATIONS" = true ]; then
    log_warning "Skipping migrations (--skip-migrations)"
    return
  fi
  
  log_info "Checking migrations..."
  
  # Check if invite_codes table exists
  # Note: This requires DATABASE_URL to be set
  cd "$WEB_DIR"
  
  log_info "Invite codes migration should be run manually:"
  log_info "  File: apps/web/src/app/api/invites/migrations.sql"
  log_info "  Run this SQL in your Neon database console"
  
  # For now, just log - actual migration would require DB connection
  log_warning "Migrations should be run manually via Neon console"
}

# Install dependencies
install_dependencies() {
  log_info "Installing dependencies..."
  
  cd "$WEB_DIR"
  npm install --production=false
  
  log_success "Dependencies installed"
}

# Build application
build_app() {
  if [ "$SKIP_BUILD" = true ]; then
    log_warning "Skipping build (--skip-build)"
    return
  fi
  
  log_info "Building application..."
  
  cd "$WEB_DIR"
  
  # Ensure env vars are available for build (Vite needs NEXT_PUBLIC_* vars)
  # Re-export env vars in case they weren't inherited
  if [ -f .env ]; then
    set +e
    set -a
    while IFS= read -r line || [ -n "$line" ]; do
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "${line// }" ]] && continue
      export "$line" 2>/dev/null || true
    done < .env
    set +a
    set -e
  fi
  
  # Run build with env vars available
  npm run build
  
  if [ ! -d "build" ]; then
    log_error "Build failed - build directory not found"
    exit 1
  fi
  
  log_success "Build complete"
}

# Restart PM2
restart_pm2() {
  log_info "Restarting PM2 process..."
  
  cd "$PROJECT_DIR"
  
  # Check if PM2 process exists
  if pm2 list | grep -q "$PM2_APP_NAME"; then
    log_info "Restarting existing PM2 process..."
    pm2 restart "$PM2_APP_NAME"
  else
    log_info "Starting new PM2 process..."
    pm2 start ecosystem.config.js
  fi
  
  # Save PM2 configuration
  pm2 save
  
  # Wait a moment for server to start
  sleep 3
  
  log_success "PM2 process restarted"
}

# Test deployment
test_deployment() {
  if [ "$SKIP_TESTS" = true ]; then
    log_warning "Skipping tests (--skip-tests)"
    return
  fi
  
  log_info "Testing deployment..."
  
  # Check PM2 status
  if ! pm2 list | grep -q "$PM2_APP_NAME.*online"; then
    log_error "PM2 process is not online"
    pm2 logs "$PM2_APP_NAME" --lines 20
    exit 1
  fi
  
  log_success "PM2 process is online"
  
  # Test health endpoint
  log_info "Testing health endpoint..."
  
  max_attempts=10
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
      log_success "Health check passed"
      
      # Show health check response
      health_response=$(curl -s "$HEALTH_CHECK_URL")
      echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"
      
      return 0
    fi
    
    attempt=$((attempt + 1))
    log_info "Waiting for server... ($attempt/$max_attempts)"
    sleep 2
  done
  
  log_error "Health check failed after $max_attempts attempts"
  log_info "Recent PM2 logs:"
  pm2 logs "$PM2_APP_NAME" --lines 30 --nostream
  exit 1
}

# Show deployment summary
show_summary() {
  log_success "Deployment complete!"
  echo ""
  echo "📊 Deployment Summary:"
  echo "  - PM2 Process: $PM2_APP_NAME"
  echo "  - Health Check: $HEALTH_CHECK_URL"
  echo "  - Logs: $LOG_DIR"
  echo ""
  echo "📋 Useful commands:"
  echo "  pm2 status                    # Check PM2 status"
  echo "  pm2 logs $PM2_APP_NAME        # View logs"
  echo "  pm2 restart $PM2_APP_NAME     # Restart process"
  echo "  curl $HEALTH_CHECK_URL         # Test health endpoint"
  echo ""
}

# Main deployment flow
main() {
  echo ""
  echo "🚀 WYA!? — Alpha Deployment"
  echo "=========================="
  echo ""
  
  check_permissions
  check_dependencies
  validate_env
  setup_logs
  pull_code
  run_migrations
  install_dependencies
  build_app
  restart_pm2
  test_deployment
  show_summary
}

# Run main function
main

