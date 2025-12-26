module.exports = {
  apps: [
    {
      name: "fapnchat-web",
      cwd: "/var/www/fapnchat/apps/web",
      script: "node",
      args: "serve.mjs",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};

