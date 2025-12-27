/**
 * WYA!? — PM2 Configuration (Alpha)
 * 
 * Purpose: Stable, boring, predictable deployment
 * 
 * Alpha-Only Decisions:
 * 
 * 1. Single instance (instances: 1, exec_mode: "fork")
 *    - Why: Alpha doesn't need horizontal scaling, simpler debugging
 *    - Future: Cluster mode for production, load balancing
 * 
 * 2. Memory limit: 500MB
 *    - Why: Conservative limit for Alpha, prevents memory leaks
 *    - Future: Increase based on actual usage, per-instance limits
 * 
 * 3. No file watching (watch: false)
 *    - Why: Production doesn't need hot reload, better performance
 *    - Future: Keep disabled (dev server handles watching)
 * 
 * 4. Simple log rotation
 *    - Why: PM2 handles basic rotation, sufficient for Alpha
 *    - Future: External log aggregation, structured logging
 * 
 * 5. 10s graceful shutdown timeout
 *    - Why: Alpha has minimal cleanup, 10s is generous
 *    - Future: Tune based on actual cleanup time, connection draining
 */

module.exports = {
  apps: [
    {
      name: "fapnchat-web",
      cwd: "/var/www/fapnchat/apps/web",
      script: "npm",
      args: "start",
      
      // Environment
      env: {
        NODE_ENV: "production",
        PORT: 4000
      },
      
      // Process Management
      instances: 1, // Alpha: single instance only
      exec_mode: "fork", // Not cluster mode for Alpha
      
      // Auto-restart
      autorestart: true,
      max_restarts: 5, // Reduced to prevent rapid restart loops
      min_uptime: "30s", // Must stay up 30s to be considered stable
      restart_delay: 10000, // Wait 10s before restart to ensure port is released
      
      // Resource Limits (Alpha: conservative)
      max_memory_restart: "500M", // Restart if memory exceeds 500MB
      
      // Logging
      error_file: "/var/log/fapnchat/error.log",
      out_file: "/var/log/fapnchat/out.log",
      log_file: "/var/log/fapnchat/combined.log",
      time: true, // Add timestamps
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      
      // Graceful Shutdown
      kill_timeout: 10000, // 10s grace period for cleanup
      listen_timeout: 15000, // Wait 15s for app to start listening (react-router-serve may need more time)
      shutdown_with_message: true, // Send shutdown message to app
      
      // Monitoring
      watch: false, // Alpha: no file watching in production
      ignore_watch: ["node_modules", "build", ".git"],
      
      // Advanced
      instance_var: "INSTANCE_ID",
      source_map_support: true,
      vizion: false // Disable git integration for Alpha
    }
  ]
};

