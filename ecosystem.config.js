module.exports = {
  apps: [
    {
      name: "fapnchat-web",
      cwd: "/var/www/fapnchat/apps/web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};

