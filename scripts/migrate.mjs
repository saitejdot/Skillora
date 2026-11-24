import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  const content = fs.readFileSync('prisma/init.sql', 'utf8');
  
  // Strip out full-line SQL comments (-- ...)
  const cleanContent = content
    .split('\n')
    .map(line => line.trim().startsWith('--') ? '' : line)
    .join('\n');

  // Split by semicolon
  const statements = cleanContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      const snippet = stmt.replace(/\s+/g, ' ').slice(0, 60);
      console.log(`[${i + 1}/${statements.length}] SUCCESS: ${snippet}...`);
    } catch (err) {
      const errMsg = err.message || String(err);
      if (errMsg.includes('already exists') || errMsg.includes('duplicate key')) {
        console.log(`[${i + 1}/${statements.length}] SKIPPED: ${stmt.replace(/\s+/g, ' ').slice(0, 50)}`);
      } else {
        console.error(`[${i + 1}/${statements.length}] FAILED: ${stmt.replace(/\s+/g, ' ').slice(0, 70)}`);
        console.error('Error detail:', errMsg);
      }
    }
  }

  // Check tables created
  const tables = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('\nCreated tables in database:', tables.map(t => t.table_name));
}

main().catch(console.error);
