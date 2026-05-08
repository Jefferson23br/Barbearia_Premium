require('dotenv').config();

const useOracle = Boolean(process.env.ORACLE_HOST && process.env.ORACLE_USER && process.env.ORACLE_PASSWORD);

function normalizeRowKeys(row) {
  return Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase()] = row[key];
    return acc;
  }, {});
}

if (!useOracle) {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'barbearia_premium',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  module.exports = pool;
} else {
  const oracledb = require('oracledb');
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

  function adaptSql(sql) {
    return sql
      .replace(/\bprotese\./gi, '')
      .replace(/\$(\d+)/g, ':$1')
      .replace(/\bTRUE\b/gi, '1')
      .replace(/\bFALSE\b/gi, '0')
      .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
      .replace(/LIMIT\s+1/gi, 'FETCH FIRST 1 ROWS ONLY');
  }

  async function executeQuery(conn, sql, params = [], autoCommit = true) {
    const adaptedSql = adaptSql(sql);
    const binds = Array.isArray(params) ? params : [];
    const result = await conn.execute(adaptedSql, binds, { autoCommit });
    const rows = (result.rows || []).map(normalizeRowKeys);
    return { rows, rowCount: rows.length };
  }

  const connectString = `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT || '1521'}/${process.env.ORACLE_SERVICE_NAME}`;

  const oracleDb = {
    async query(sql, params = []) {
      const conn = await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString,
      });
      try {
        return await executeQuery(conn, sql, params, true);
      } finally {
        await conn.close();
      }
    },

    async connect() {
      const conn = await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString,
      });

      return {
        async query(sql, params = []) {
          const normalized = sql.trim().toUpperCase();
          if (normalized === 'BEGIN') {
            return { rows: [], rowCount: 0 };
          }
          if (normalized === 'COMMIT') {
            await conn.commit();
            return { rows: [], rowCount: 0 };
          }
          if (normalized === 'ROLLBACK') {
            await conn.rollback();
            return { rows: [], rowCount: 0 };
          }
          return executeQuery(conn, sql, params, false);
        },
        async release() {
          await conn.close();
        },
      };
    },
  };

  module.exports = oracleDb;
}
