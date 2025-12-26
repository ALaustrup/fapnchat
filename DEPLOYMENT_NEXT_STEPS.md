# FapNChat Deployment - Next Steps Guide

## ✅ Completed

1. ✅ **Database Setup** - Neon PostgreSQL configured with all migrations completed (17 tables)
2. ✅ **Server Build** - Production build completed successfully
3. ✅ **Environment Variables** - `.env` file configured on server
4. ✅ **Nginx** - Already running on ports 80 and 443

## 🔧 Current Status

- **Server**: PM2 process exists but needs to be fixed (crashing on startup)
- **Port 4000**: Not listening (server needs to start successfully)
- **Nginx**: Running but not configured to proxy to the app
- **SSL**: Not configured yet
- **DNS**: Not configured yet

## 📋 Next Steps

### Step 1: Fix Server Startup ⚠️ IN PROGRESS

The server is crashing because environment variables aren't being loaded properly. The updated `server.js` now loads `.env` before importing modules.

**Test the server:**
```bash
ssh root@51.210.209.112
cd /var/www/fapnchat/apps/web
export DATABASE_URL='postgresql://neondb_owner:npg_a5R9CDbJedkp@ep-sparkling-cell-aecjn7xp.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
node server.js
```

**If it starts successfully:**
```bash
pm2 restart fapnchat
pm2 save
```

### Step 2: Configure Nginx Reverse Proxy

Copy the Nginx configuration to the server:

```bash
# From your local machine
scp -i ~/.ssh/matrix1 nginx-fapnchat.conf root@51.210.209.112:/etc/nginx/sites-available/fapnchat

# SSH into server
ssh -i ~/.ssh/matrix1 root@51.210.209.112

# Enable the site
ln -s /etc/nginx/sites-available/fapnchat /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

**Important**: The Nginx config will proxy to `http://localhost:4000`. Make sure the server is running on port 4000 first.

### Step 3: Set Up SSL Certificates (Let's Encrypt)

**Prerequisites:**
- DNS must be configured first (Step 4)
- Nginx must be configured (Step 2)

```bash
# Install Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Get certificates for both domains
certbot --nginx -d fapn.chat -d www.fapn.chat -d fapnchat.xyz -d www.fapnchat.xyz

# Certbot will automatically configure SSL in Nginx
# Follow the prompts to set up automatic renewal
```

### Step 4: Configure DNS Records

Configure DNS for both domains to point to your server:

**For FapN.Chat (fapn.chat):**
- **A Record**: `@` → `51.210.209.112`
- **A Record**: `www` → `51.210.209.112`

**For FapNChat.xyz:**
- **A Record**: `@` → `51.210.209.112`
- **A Record**: `www` → `51.210.209.112`

**DNS Propagation**: Changes can take 24-48 hours to propagate globally. You can check propagation with:
- https://www.whatsmydns.net/
- https://dnschecker.org/

### Step 5: Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set endpoint URL to: `https://fapn.chat/api/payments/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed` ✅ (Required)
   - `payment_intent.succeeded` (Optional)
   - `payment_intent.payment_failed` (Optional)
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `/var/www/fapnchat/apps/web/.env`:
   ```bash
   ssh root@51.210.209.112
   cd /var/www/fapnchat/apps/web
   nano .env
   # Add: STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
7. Restart the application:
   ```bash
   pm2 restart fapnchat
   ```

### Step 6: Verify Deployment

**Check server status:**
```bash
pm2 status
pm2 logs fapnchat --lines 50
```

**Test locally on server:**
```bash
curl http://localhost:4000
```

**Test through Nginx:**
```bash
curl http://51.210.209.112
curl https://fapn.chat  # After DNS and SSL are configured
```

**Check Nginx logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔍 Troubleshooting

### Server Not Starting

1. **Check PM2 logs:**
   ```bash
   pm2 logs fapnchat --lines 100
   ```

2. **Check environment variables:**
   ```bash
   cd /var/www/fapnchat/apps/web
   cat .env
   ```

3. **Test server manually:**
   ```bash
   cd /var/www/fapnchat/apps/web
   export DATABASE_URL='postgresql://neondb_owner:npg_a5R9CDbJedkp@ep-sparkling-cell-aecjn7xp.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
   node server.js
   ```

### Port 4000 Not Listening

1. **Check if process is running:**
   ```bash
   ss -tlnp | grep 4000
   ```

2. **Check PM2 status:**
   ```bash
   pm2 status
   ```

3. **Restart PM2:**
   ```bash
   pm2 restart fapnchat
   ```

### Nginx 502 Bad Gateway

This usually means Nginx can't connect to the backend server.

1. **Check if server is running:**
   ```bash
   curl http://localhost:4000
   ```

2. **Check Nginx error logs:**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. **Verify Nginx config:**
   ```bash
   nginx -t
   ```

### SSL Certificate Issues

1. **Check certificate status:**
   ```bash
   certbot certificates
   ```

2. **Test renewal:**
   ```bash
   certbot renew --dry-run
   ```

3. **Manually renew if needed:**
   ```bash
   certbot renew
   systemctl reload nginx
   ```

## 📊 Monitoring

### PM2 Monitoring

```bash
# View real-time monitoring
pm2 monit

# View logs
pm2 logs fapnchat

# View status
pm2 status
```

### System Resources

```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Network connections
ss -tlnp
```

## 🔄 Updating the Application

When you need to deploy updates:

```bash
ssh root@51.210.209.112
cd /var/www/fapnchat
git pull origin main
cd apps/web
npm install --legacy-peer-deps
npm run build
pm2 restart fapnchat
```

## 📝 Environment Variables Checklist

Ensure all required variables are set in `/var/www/fapnchat/apps/web/.env`:

- ✅ `DATABASE_URL` - Configured
- ✅ `NEXT_PUBLIC_APP_URL` - Set to `https://fapn.chat`
- ✅ `STRIPE_SECRET_KEY` - Configured
- ⚠️ `STRIPE_WEBHOOK_SECRET` - **Set after configuring webhook (Step 5)**
- ✅ `AUTH_SECRET` - Configured
- ⚠️ `SPOTIFY_CLIENT_ID` - Optional (for Spotify integration)
- ⚠️ `SPOTIFY_CLIENT_SECRET` - Optional
- ⚠️ `SOUNDCLOUD_CLIENT_ID` - Optional (for SoundCloud integration)

## 🎯 Quick Reference Commands

```bash
# Server management
pm2 restart fapnchat
pm2 logs fapnchat
pm2 status

# Nginx management
nginx -t                    # Test config
systemctl reload nginx      # Reload config
systemctl status nginx      # Check status

# SSL management
certbot certificates        # List certificates
certbot renew              # Renew certificates

# Database
# Migrations already run via run-migrations-node.js
# Test connection: node test-db.js
```

## 🚀 Deployment Checklist

- [ ] Step 1: Fix server startup and verify it's listening on port 4000
- [ ] Step 2: Configure Nginx reverse proxy
- [ ] Step 3: Set up SSL certificates (requires DNS first)
- [ ] Step 4: Configure DNS records
- [ ] Step 5: Configure Stripe webhooks
- [ ] Step 6: Verify deployment and test all endpoints

