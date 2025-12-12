const pool = require('./config/database');

async function checkTableStructure() {
  try {
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'protese' 
      AND table_name = 'usuarios_administrativos' 
      ORDER BY ordinal_position
    `);
    
    console.log('Estrutura da tabela protese.usuarios_administrativos:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    // Verificar constraints NOT NULL
    const constraints = await pool.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        a.attname as column_name
      FROM pg_constraint con
      INNER JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
      INNER JOIN pg_class rel ON rel.oid = con.conrelid
      INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'protese' 
      AND rel.relname = 'usuarios_administrativos'
      AND con.contype = 'n'
    `);
    
    console.log('\nConstraints NOT NULL:');
    console.log(JSON.stringify(constraints.rows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkTableStructure();

