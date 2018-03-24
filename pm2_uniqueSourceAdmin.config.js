// run tasks only ones
const apps = {
    name: 'uniqueSourceAdmin',
    script: './uniqueSourceAdmin.js',
    instances: 1,
    exec_mode: 'cluster',
    pid_file: './log/pm2/uniqueSourceAdminpid.log',
    out_file: './log/pm2/uniqueSourceAdmin/out.log',
    error_file: './log/pm2/uniqueSourceAdmin/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss ',
    combine_logs: true,
    env: {
        NODE_ENV: 'pro'
    },
    env_qa: {
        NODE_ENV: 'qa'
    },
    env_test: {
        NODE_ENV: 'test'
    },
    env_dev: {
        NODE_ENV: 'dev'
    }
}
module.exports = { apps }
