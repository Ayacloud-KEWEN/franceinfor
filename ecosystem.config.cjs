// PM2 process config for production (CloudPanel VPS).
// Runs the Next.js production server on PORT (default 3001) — pick a port that
// does NOT clash with other sites already running on this server.
//
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup
//   pm2 reload ecosystem.config.cjs   # zero-downtime restart after a deploy
module.exports = {
  apps: [
    {
      name: 'france-os',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: __dirname,
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    },
  ],
};
