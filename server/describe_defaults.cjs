const db = require('./db');
async function run() {
  try {
    const defaults = await db.query("SELECT table_name, column_name, column_default FROM information_schema.columns WHERE table_schema = 'public'");
    console.table(defaults.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
