# WYA!? — Alpha Deployment Script Guide

## Quick Start

```bash
# On the server
cd /var/www/fapnchat
./deploy-alpha.sh
```

## Script Options

```bash
# Skip build (if build already exists)
./deploy-alpha.sh --skip-build

# Skip migrations (if already run)
./deploy-alpha.sh --skip-migrations

# Skip health check tests
./deploy-alpha.sh --skip-tests

# Combine options
./deploy-alpha.sh --skip-migrations --skip-tests
```

## What the Script Does

1. **Validates Environment**
   - Checks for required environment variables
   - Validates DATABASE_URL format
   - Validates AUTH_SECRET length

2. **Sets Up Logs**
   - Creates `/var/log/fapnchat` directory
   - Sets proper permissions

3. **Pulls Latest Code**
   - Fetches from `origin/main`
   - Pulls latest changes

4. **Runs Migrations**
   - Prompts to run invite codes migration manually
   - (Requires Neon database console)

5. **Installs Dependencies**
   - Runs `npm install` in `apps/web`

6. **Builds Application**
   - Runs `npm run build`
   - Verifies build directory exists

7. **Restarts PM2**
   - Restarts or starts PM2 process
   - Saves PM2 configuration

8. **Tests Deployment**
   - Checks PM2 process status
   - Tests health endpoint (`/api/health`)
   - Shows deployment summary

## Prerequisites

- Node.js 20.x installed
- PM2 installed globally
- Git repository cloned to `/var/www/fapnchat`
- `.env` file configured in `apps/web/.env`
- Database migrations run (invite codes table)

## Manual Steps Required

### 1. Run Invite Codes Migration

The script will prompt you, but you need to run this SQL manually in your Neon database console:

```sql
-- File: apps/web/src/app/api/invites/migrations.sql
CREATE TABLE IF NOT EXISTS invite_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_by VARCHAR(255),
  used_by VARCHAR(255) REFERENCES auth_users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON invite_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_at ON invite_codes(used_at);
```

### 2. Create Initial Invite Codes (if using invite-only mode)

```sql
INSERT INTO invite_codes (code) VALUES 
  ('ALPHA001'), 
  ('ALPHA002'), 
  ('ALPHA003');
```

## Troubleshooting

### Build Fails

```bash
# Check Node.js version
node --version  # Should be 20.x

# Clear node_modules and reinstall
cd apps/web
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PM2 Process Not Starting

```bash
# Check PM2 logs
pm2 logs fapnchat-web --lines 50

# Check environment variables
cd apps/web
cat .env | grep -E "DATABASE_URL|AUTH_SECRET|NEXT_PUBLIC_APP_URL"

# Test server manually
node start-server.mjs
```

### Health Check Fails

```bash
# Check if server is listening
netstat -tlnp | grep 4000

# Test health endpoint manually
curl http://localhost:4000/api/health

# Check PM2 status
pm2 status
pm2 logs fapnchat-web --lines 30
```

## Post-Deployment Verification

```bash
# 1. Check PM2 status
pm2 status

# 2. Test health endpoint
curl http://localhost:4000/api/health

# 3. Check logs
pm2 logs fapnchat-web --lines 50

# 4. Test invite-only mode (if enabled)
curl http://localhost:4000/api/invites/check-mode

# 5. Generate invite codes (as admin)
# (Requires authentication cookie)
curl -H "Cookie: authjs.session-token=..." \
  http://localhost:4000/api/invites/generate?count=5
```

## Rollback

If deployment fails:

```bash
# Stop PM2 process
pm2 stop fapnchat-web

# Checkout previous commit
cd /var/www/fapnchat
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
cd apps/web
npm run build
cd ../..
pm2 restart fapnchat-web
```

## Security Notes

- Script requires root/sudo for log directory creation
- Environment variables are validated before deployment
- PM2 process runs with user permissions (not root)
- Logs are stored in `/var/log/fapnchat` with proper permissions

---

**Last Updated:** Alpha Deployment Preparation

