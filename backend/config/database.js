require('dotenv').config();
const { Pool } = require('pg');

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'protese_capilar',
  user: process.env.DB_USER || 'protese_user',
  password: process.env.DB_PASSWORD,
  schema: 'protese',
});

module.exports = pool;






