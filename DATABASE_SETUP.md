# PostgreSQL Database Setup Guide

Your application uses **Neon Database** (serverless PostgreSQL) or a standard PostgreSQL database. Here are two setup options:

## Option 1: Neon Database (Recommended - Cloud, Easy Setup)

Neon is a serverless PostgreSQL that's perfect for this application. It's free to start and scales automatically.

### Steps:

1. **Sign up for Neon**: Go to https://neon.tech and create a free account

2. **Create a new project**:
   - Click "Create Project"
   - Choose a name (e.g., "FapNChat")
   - Select a region close to your server
   - Click "Create Project"

3. **Get your connection string**:
   - After creating the project, you'll see a connection string like:
     ```
     postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```
   - Copy this connection string

4. **Update your `.env` file**:
   ```bash
   # On your server:
   ssh root@51.210.209.112
   cd /var/www/fapnchat/apps/web
   nano .env
   ```
   
   Update the `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

5. **Run migrations** (see below)

---

## Option 2: Self-Hosted PostgreSQL on Your Server

If you prefer to host PostgreSQL on your own server:

### Steps:

1. **Install PostgreSQL**:
   ```bash
   ssh root@51.210.209.112
   apt-get update
   apt-get install -y postgresql postgresql-contrib
   ```

2. **Create database and user**:
   ```bash
   sudo -u postgres psql
   ```
   
   Then in PostgreSQL prompt:
   ```sql
   CREATE DATABASE fapnchat;
   CREATE USER fapnchat_user WITH PASSWORD 'your_secure_password_here';
   GRANT ALL PRIVILEGES ON DATABASE fapnchat TO fapnchat_user;
   \q
   ```

3. **Update your `.env` file**:
   ```bash
   cd /var/www/fapnchat/apps/web
   nano .env
   ```
   
   Update the `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_a5R9CDbJedkp@ep-sparkling-cell-aecjn7xp-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. **Run migrations** (see below)

---

## Running Database Migrations

After setting up your database, you need to run all migration files. The application requires these tables:

### Migration Files (in order):

1. **Auth tables** (created automatically by @auth/core when first user signs up)
2. `apps/web/src/app/api/profile/migrations.sql` - User profiles
3. `apps/web/src/app/api/bits/migrations.sql` - Bits currency system
4. `apps/web/src/app/api/payments/migrations.sql` - Payment tracking
5. `apps/web/src/app/api/music/migrations.sql` - Music integration
6. `apps/web/src/app/api/chatrooms/migrations.sql` - Chat rooms
7. `apps/web/src/app/api/webrtc/migrations.sql` - WebRTC video chat

### Option A: Run migrations via psql (Recommended)

```bash
# Copy migration files to server
scp apps/web/src/app/api/*/migrations.sql root@51.210.209.112:/tmp/

# SSH into server
ssh root@51.210.209.112

# For Neon Database (using your actual connection string):
export DATABASE_URL="postgresql://neondb_owner:npg_a5R9CDbJedkp@ep-sparkling-cell-aecjn7xp.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
psql "$DATABASE_URL" -f /tmp/profile/migrations.sql
psql "$DATABASE_URL" -f /tmp/bits/migrations.sql
psql "$DATABASE_URL" -f /tmp/payments/migrations.sql
psql "$DATABASE_URL" -f /tmp/music/migrations.sql
psql "$DATABASE_URL" -f /tmp/chatrooms/migrations.sql
psql "$DATABASE_URL" -f /tmp/webrtc/migrations.sql

# Or use the automated migration script:
cd /var/www/fapnchat
DATABASE_URL="postgresql://neondb_owner:npg_a5R9CDbJedkp@ep-sparkling-cell-aecjn7xp.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" bash /root/run-migrations.sh

# For local PostgreSQL:
sudo -u postgres psql fapnchat -f /tmp/profile/migrations.sql
sudo -u postgres psql fapnchat -f /tmp/bits/migrations.sql
sudo -u postgres psql fapnchat -f /tmp/payments/migrations.sql
sudo -u postgres psql fapnchat -f /tmp/music/migrations.sql
sudo -u postgres psql fapnchat -f /tmp/chatrooms/migrations.sql
sudo -u postgres psql fapnchat -f /tmp/webrtc/migrations.sql
```

### Option B: Use Neon SQL Editor

If using Neon:
1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Copy and paste each migration file content
4. Run them one by one

### Option C: Automated Migration Script

I'll create a script to run all migrations automatically (see `run-migrations.sh` below).

---

## Verify Database Setup

Test your connection:

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check if tables exist
psql "$DATABASE_URL" -c "\dt"
```

You should see tables like:
- `auth_users`
- `auth_sessions`
- `user_profiles`
- `user_bits`
- `chat_rooms`
- etc.

---

## Troubleshooting

### Connection Issues

**Error: "connection refused"**
- Check if PostgreSQL is running: `systemctl status postgresql`
- Check firewall: `ufw status`
- Verify connection string format

**Error: "authentication failed"**
- Verify username and password
- Check PostgreSQL user permissions

**Error: "database does not exist"**
- Create the database first
- Verify database name in connection string

### Migration Issues

**Error: "relation already exists"**
- Tables already created, this is fine
- Migrations use `CREATE TABLE IF NOT EXISTS`

**Error: "function already exists"**
- Functions already created, this is fine
- Migrations use `CREATE OR REPLACE FUNCTION`

---

## Security Best Practices

1. **Use strong passwords** for database users
2. **Restrict database access** to your application server only
3. **Use SSL connections** (Neon does this automatically)
4. **Never commit** `.env` files with database credentials
5. **Regular backups** - Neon has automatic backups, or set up pg_dump for self-hosted

---

## Next Steps

After setting up the database:
1. ✅ Database created and configured
2. ✅ Migrations run successfully
3. ✅ `DATABASE_URL` set in `.env`
4. ✅ Test connection works
5. → Build and start your application (see DEPLOYMENT.md)


