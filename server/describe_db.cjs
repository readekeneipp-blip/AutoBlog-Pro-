const db = require('./db');
async function run() {
  try {
    const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables:", tables.rows.map(r => r.table_name));
    for (const table of tables.rows) {
      const cols = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table.table_name]);
      console.log(`Table: ${table.table_name}`);
      console.table(cols.rows);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
