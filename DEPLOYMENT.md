# FapNChat Deployment Guide

## ✅ Completed Steps

1. **Security Vulnerability Fixed** - Updated `pdfjs-dist` to v5.4.449
2. **Dev Server Started** - Running locally for testing
3. **Server Setup** - Node.js 20.x and PM2 installed on server
4. **Code Deployed** - Repository cloned to `/var/www/fapnchat`
5. **Dependencies Installed** - All npm packages installed
6. **Stripe Webhook Handler** - Fixed and ready for production

## 🔧 Remaining Configuration Steps

### 1. Database Configuration

**IMPORTANT**: You need to set up your PostgreSQL database and update the `DATABASE_URL` in `/var/www/fapnchat/apps/web/.env`:

```bash
ssh root@51.210.209.112
cd /var/www/fapnchat/apps/web
nano .env  # Edit DATABASE_URL with your actual database connection string
```

Example:
```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

### 2. Run Database Migrations

After setting up the database, run the SQL migrations:

```bash
cd /var/www/fapnchat/apps/web
# Connect to your database and run all migration files:
# - src/app/api/bits/migrations.sql
# - src/app/api/chatrooms/migrations.sql
# - src/app/api/music/migrations.sql
# - src/app/api/payments/migrations.sql
# - src/app/api/profile/migrations.sql
# - src/app/api/webrtc/migrations.sql
```

### 3. Build and Start Application

```bash
cd /var/www/fapnchat/apps/web
npm run build
pm2 start npm --name fapnchat -- start
pm2 save
pm2 startup  # Follow instructions to enable auto-start on boot
```

### 4. Configure Nginx

Copy the nginx configuration:

```bash
scp nginx-fapnchat.conf root@51.210.209.112:/etc/nginx/sites-available/fapnchat
ssh root@51.210.209.112
ln -s /etc/nginx/sites-available/fapnchat /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

**Note**: You'll need to:
- Install SSL certificates (Let's Encrypt recommended)
- Update the SSL certificate paths in the nginx config
- Uncomment the SSL certificate lines

### 5. DNS Configuration

Configure your DNS records for both domains:

**For FapN.Chat:**
- **A Record**: `@` → `51.210.209.112`
- **A Record**: `www` → `51.210.209.112`

**For FapNChat.xyz:**
- **A Record**: `@` → `51.210.209.112`
- **A Record**: `www` → `51.210.209.112`

DNS changes can take 24-48 hours to propagate.

### 6. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://fapn.chat/api/payments/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `/var/www/fapnchat/apps/web/.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
7. Restart the application: `pm2 restart fapnchat`

### 7. SSL Certificate Setup (Let's Encrypt)

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d fapn.chat -d www.fapn.chat -d fapnchat.xyz -d www.fapnchat.xyz
```

This will automatically configure SSL in nginx.

## 📋 Environment Variables Checklist

Ensure all required variables are set in `/var/www/fapnchat/apps/web/.env`:

- ✅ `DATABASE_URL` - **REQUIRED** (set your database connection)
- ✅ `NEXT_PUBLIC_APP_URL` - Set to `https://fapn.chat`
- ✅ `STRIPE_SECRET_KEY` - Already configured
- ⚠️ `STRIPE_WEBHOOK_SECRET` - **Set after configuring webhook**
- ✅ `AUTH_SECRET` - Already generated
- ⚠️ `SPOTIFY_CLIENT_ID` - Optional (for Spotify integration)
- ⚠️ `SPOTIFY_CLIENT_SECRET` - Optional
- ⚠️ `SOUNDCLOUD_CLIENT_ID` - Optional (for SoundCloud integration)

## 🚀 Monitoring and Maintenance

### Check Application Status
```bash
pm2 status
pm2 logs fapnchat
pm2 monit
```

### Restart Application
```bash
pm2 restart fapnchat
```

### Update Application
```bash
cd /var/www/fapnchat
git pull origin main
cd apps/web
npm install --legacy-peer-deps
npm run build
pm2 restart fapnchat
```

## 🔒 Security Notes

1. **Database**: Use strong passwords and restrict database access
2. **SSL**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files to git
4. **Firewall**: Configure firewall to only allow necessary ports (22, 80, 443)
5. **Stripe Keys**: Keep your Stripe secret keys secure

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs fapnchat`
2. Check nginx logs: `tail -f /var/log/nginx/fapnchat-error.log`
3. Verify environment variables are set correctly
4. Ensure database is accessible and migrations are run

