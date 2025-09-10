
// require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  // connectionString: process.env.DATABASE_URL,
  connectionString:
    "postgresql://postgres:appliedinsights2202@db.zwgeerzhxypxljlgseig.supabase.co:5432/postgres",

  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
