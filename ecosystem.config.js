module.exports = {
  apps: [
    {
      script: "./dist/index.js",
    },
  ],

  deploy: {
    production: {
      user: "madisonbikes",
      host: "mbi",
      ref: "origin/main",
      repo: "https://github.com/madisonbikes/bikeweek2021-importer",
      path: "/home/madisonbikes/apps/bikeweek2021_importer",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
