module.exports = {
  apps: [
    {
      name: 'intizom-api',
      script: 'dist/src/main.js',
      instances: 2,          // 2 CPU core uchun
      exec_mode: 'cluster',  // cluster mode — load balancing
      max_memory_restart: '400M',

      env: {
        NODE_ENV: 'production',
      },

      // Logging
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Auto-restart on crash
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
