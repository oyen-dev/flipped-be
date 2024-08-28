module.exports = {
  apps: [
    {
      name: 'olearning-be',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      ignore_watch: ['node_modules']
    }
  ]
}
