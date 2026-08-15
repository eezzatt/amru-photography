const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_URL === 'production' ? {rejectUnauthorized: false} : false
})

module.exports = pool