# WYA!? — Alpha Deployment Checklist

**Purpose:** Stable, boring, predictable Alpha deployment  
**Status:** 🔒 Pre-deployment validation

---

## Pre-Deployment Checklist

### 1. Environment Variables ✅

- [ ] `DATABASE_URL` - Valid PostgreSQL connection string
- [ ] `AUTH_SECRET` - At least 32 characters (generate with: `openssl rand -base64 32`)
- [ ] `NEXT_PUBLIC_APP_URL` - Public-facing URL (e.g., `https://fapn.chat`)
- [ ] `PORT` - Server port (default: 4000)
- [ ] `HOST` - Server host (default: 0.0.0.0)
- [ ] `LOG_LEVEL` - Logging level: `error`, `warn`, `info`, or `debug` (default: `info`)
- [ ] `CORS_ORIGINS` - Comma-separated allowed origins (optional)
- [ ] `ALPHA_INVITE_ONLY` - Set to `true` to enable invite-only signup
- [ ] `ALPHA_ADMIN_EMAILS` - Comma-separated admin emails for invite generation

**Validation:** Run `node -e "import('./apps/web/src/utils/envValidation.js').then(m => m.validateEnv())"` to verify

---

### 2. Database Setup ✅

- [ ] All migrations run successfully
- [ ] `invite_codes` table created (run `apps/web/src/app/api/invites/migrations.sql`)
- [ ] Initial invite codes inserted (if using invite-only mode)
- [ ] Database connection tested

**Create initial invite codes:**
```sql
INSERT INTO invite_codes (code) VALUES 
  ('ALPHA001'), 
  ('ALPHA002'), 
  ('ALPHA003');
```

---

### 3. PM2 Configuration ✅

- [ ] `ecosystem.config.js` configured correctly
- [ ] Log directory exists: `/var/log/fapnchat/`
- [ ] PM2 process name matches config
- [ ] Memory limit set (500MB for Alpha)
- [ ] Auto-restart enabled

**Commands:**
```bash
# Create log directory
sudo mkdir -p /var/log/fapnchat
sudo chown $USER:$USER /var/log/fapnchat

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

---

### 4. Build & Deployment ✅

- [ ] Production build completed: `npm run build` in `apps/web`
- [ ] Build artifacts exist in `apps/web/build/`
- [ ] Server entry point exists: `apps/web/start-server.mjs`
- [ ] Environment validation runs on startup

**Build command:**
```bash
cd apps/web
npm run build
```

---

### 5. Health Check ✅

- [ ] Health endpoint accessible: `GET /api/health`
- [ ] Returns 200 with `status: "healthy"` when server is running
- [ ] Database connectivity check works
- [ ] Monitoring system configured (if applicable)

**Test:**
```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "alpha",
  "checks": {
    "server": true,
    "database": true
  },
  "responseTime": "5ms"
}
```

---

### 6. Invite-Only Access Gate ✅

- [ ] `ALPHA_INVITE_ONLY` environment variable set
- [ ] Invite codes table created
- [ ] Initial invite codes generated
- [ ] Signup page validates invite codes
- [ ] Admin endpoint for generating codes works: `GET /api/invites/generate`

**Enable invite-only mode:**
```bash
export ALPHA_INVITE_ONLY=true
export ALPHA_ADMIN_EMAILS=admin@example.com
```

**Generate invite codes (as admin):**
```bash
curl -H "Cookie: authjs.session-token=..." \
  http://localhost:4000/api/invites/generate?count=5
```

---

### 7. Graceful Shutdown ✅

- [ ] Server handles SIGTERM gracefully
- [ ] Server handles SIGINT gracefully
- [ ] Connections close cleanly
- [ ] No data loss on shutdown
- [ ] PM2 restart works correctly

**Test graceful shutdown:**
```bash
pm2 restart fapnchat-web
# Should see "Graceful shutdown complete" in logs
```

---

### 8. Logging & Monitoring ✅

- [ ] Logs written to `/var/log/fapnchat/`
- [ ] Error logs separate from output logs
- [ ] Log rotation configured (via PM2 or logrotate)
- [ ] Error tracking configured (if applicable)

**View logs:**
```bash
pm2 logs fapnchat-web
# Or
tail -f /var/log/fapnchat/combined.log
```

---

### 9. Security ✅

- [ ] `AUTH_SECRET` is strong (32+ characters)
- [ ] Database credentials secure
- [ ] CORS configured correctly (if needed)
- [ ] HTTPS configured (via reverse proxy)
- [ ] Environment variables not exposed to client

---

### 10. Reverse Proxy (Nginx) ✅

- [ ] Nginx configured to proxy to `http://localhost:4000`
- [ ] SSL certificates configured (Let's Encrypt)
- [ ] Health check endpoint accessible via proxy
- [ ] Static assets served correctly

**Nginx config example:**
```nginx
server {
    listen 80;
    server_name fapn.chat;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/health {
        proxy_pass http://localhost:4000;
        access_log off;
    }
}
```

---

## Post-Deployment Verification

### Immediate Checks

1. **Server Status**
   ```bash
   pm2 status
   pm2 logs fapnchat-web --lines 50
   ```

2. **Health Check**
   ```bash
   curl https://fapn.chat/api/health
   ```

3. **Invite Code Validation** (if enabled)
   ```bash
   curl -X POST https://fapn.chat/api/invites/validate \
     -H "Content-Type: application/json" \
     -d '{"code": "ALPHA001"}'
   ```

4. **Signup Flow** (test with valid invite code)

### Monitoring

- [ ] Server stays up for 5+ minutes without crashes
- [ ] Memory usage stable (< 500MB)
- [ ] No error spikes in logs
- [ ] Database connections stable
- [ ] Response times acceptable (< 200ms for health check)

---

## Alpha-Specific Notes

### Invite-Only Mode

**Purpose:** Control Alpha access, prevent public signups

**How it works:**
1. Set `ALPHA_INVITE_ONLY=true` in environment
2. Generate invite codes via admin endpoint
3. Users must provide valid invite code during signup
4. Codes are single-use

**Disable for testing:**
```bash
export ALPHA_INVITE_ONLY=false
pm2 restart fapnchat-web
```

### Resource Limits

- **Memory:** 500MB max (PM2 will restart if exceeded)
- **Instances:** 1 (no clustering for Alpha)
- **Connections:** Handled by Hono server

### Known Limitations (Alpha)

- No automatic invite code expiration
- No invite code usage analytics
- Simple admin check (email-based)
- No rate limiting on invite generation
- Single database connection pool

---

## Rollback Plan

If deployment fails:

1. **Stop PM2 process:**
   ```bash
   pm2 stop fapnchat-web
   ```

2. **Restore previous version:**
   ```bash
   git checkout <previous-commit>
   cd apps/web
   npm run build
   pm2 restart fapnchat-web
   ```

3. **Check logs:**
   ```bash
   pm2 logs fapnchat-web --err
   ```

---

## Support Contacts

- **Deployment Issues:** Check logs first, then escalate
- **Database Issues:** Check Neon dashboard
- **Invite Codes:** Generate via admin endpoint

---

**Last Updated:** Alpha Deployment Preparation  
**Next Review:** After first Alpha deployment

