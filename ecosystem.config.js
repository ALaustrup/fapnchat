module.exports = {
  apps: [
    {
      name: "fapnchat-web",
      cwd: "/var/www/fapnchat/apps/web",
      script: "node",
      args: "serve.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};

