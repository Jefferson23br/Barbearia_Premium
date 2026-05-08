module.exports = {
  apps: [
    {
      name: 'api-barbearia-premium',
      script: 'server.js',
      cwd: '/Projetos/Barbearia_Premium/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/Projetos/Barbearia_Premium/backend/logs/pm2-error.log',
      out_file: '/Projetos/Barbearia_Premium/backend/logs/pm2-out.log',
      log_file: '/Projetos/Barbearia_Premium/backend/logs/pm2-combined.log',
      time: true,
    },
  ],
};
