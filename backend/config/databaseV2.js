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

  function adaptDateTrunc(sql) {
    return sql.replace(
      /DATE_TRUNC\(\s*'([^']+)'\s*,\s*([^)]+)\)/gi,
      (match, unit, expr) => {
        const normalized = String(unit).toLowerCase();
        if (normalized === 'day') return `TRUNC(${expr})`;
        if (normalized === 'month') return `TRUNC(${expr}, 'MM')`;
        if (normalized === 'year') return `TRUNC(${expr}, 'YYYY')`;
        if (normalized === 'quarter') return `TRUNC(${expr}, 'Q')`;
        return match;
      }
    );
  }

  function adaptPagination(sql) {
    return sql
      .replace(
        /LIMIT\s+(:b\d+|\d+)\s+OFFSET\s+(:b\d+|\d+)/gi,
        'OFFSET $2 ROWS FETCH NEXT $1 ROWS ONLY'
      )
      .replace(
        /OFFSET\s+(:b\d+|\d+)\s+LIMIT\s+(:b\d+|\d+)/gi,
        'OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY'
      )
      .replace(/LIMIT\s+(:b\d+|\d+)/gi, 'FETCH FIRST $1 ROWS ONLY');
  }

  function adaptSql(sql) {
    const converted = sql
      .replace(/\bprotese\./gi, '')
      .replace(/\$(\d+)/g, ':b$1')
      .replace(/\bTRUE\b/gi, '1')
      .replace(/\bFALSE\b/gi, '0')
      .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
      .replace(/\bILIKE\b/gi, 'LIKE')
      .replace(/\bDATE\(([^)]+)\)/gi, 'TRUNC($1)')
      // Remove casts estilo PostgreSQL (`::numeric`, `::int`, etc.).
      .replace(/::\s*(integer|int|numeric|decimal|float|double\s+precision|date|timestamp|jsonb?|text|varchar)\b/gi, '');

    return adaptPagination(adaptDateTrunc(converted));
  }

  function toOracleBinds(params = []) {
    if (!Array.isArray(params)) return params || {};
    const binds = {};
    params.forEach((value, index) => {
      binds[`b${index + 1}`] = value;
    });
    return binds;
  }

  function getDmlTargetTable(sql) {
    const normalized = sql.trim();
    const insertMatch = normalized.match(/^INSERT\s+INTO\s+([A-Za-z0-9_."$]+)/i);
    if (insertMatch) return insertMatch[1];
    const updateMatch = normalized.match(/^UPDATE\s+([A-Za-z0-9_."$]+)/i);
    if (updateMatch) return updateMatch[1];
    return null;
  }

  function stripReturningClause(sql) {
    return sql.replace(/\s+RETURNING\s+[\s\S]*?;?\s*$/i, '');
  }

  async function executeWithReturningFallback(conn, adaptedSql, binds, autoCommit) {
    const strippedSql = stripReturningClause(adaptedSql);
    const sqlWithRowId = `${strippedSql} RETURNING ROWID INTO :out_rowid`;
    const result = await conn.execute(
      sqlWithRowId,
      {
        ...binds,
        out_rowid: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 128 },
      },
      { autoCommit }
    );

    const rowId = result.outBinds?.out_rowid;
    const targetTable = getDmlTargetTable(strippedSql);
    if (!rowId || !targetTable) {
      return { rows: [], rowCount: result.rowsAffected || 0 };
    }

    const selected = await conn.execute(
      `SELECT * FROM ${targetTable} WHERE ROWID = :rid`,
      { rid: rowId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const rows = (selected.rows || []).map(normalizeRowKeys);
    return { rows, rowCount: rows.length || result.rowsAffected || 0 };
  }

  async function initializeOracleSession(conn) {
    await conn.execute("ALTER SESSION SET NLS_COMP = LINGUISTIC");
    await conn.execute("ALTER SESSION SET NLS_SORT = BINARY_CI");
  }

  async function executeQuery(conn, sql, params = [], autoCommit = true) {
    const adaptedSql = adaptSql(sql);
    const binds = toOracleBinds(params);

    if (/\bRETURNING\b/i.test(adaptedSql) && !/\bINTO\b/i.test(adaptedSql)) {
      return executeWithReturningFallback(conn, adaptedSql, binds, autoCommit);
    }

    const result = await conn.execute(adaptedSql, binds, { autoCommit });
    const rows = (result.rows || []).map(normalizeRowKeys);
    return { rows, rowCount: rows.length || result.rowsAffected || 0 };
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
        await initializeOracleSession(conn);
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
      await initializeOracleSession(conn);

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
