require('dotenv').config({ path: '/var/www/fapnchat/apps/web/.env' });

module.exports = {
  apps: [{
    name: 'fapnchat',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/fapnchat/apps/web',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/root/.pm2/logs/fapnchat-error.log',
    out_file: '/root/.pm2/logs/fapnchat-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};

