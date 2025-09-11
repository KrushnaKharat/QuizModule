
// require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  // connectionString: process.env.DATABASE_URL,
  connectionString:

    // "postgresql://postgres:appliedinsights2202@db.zwgeerzhxypxljlgseig.supabase.co:5432/postgres",
    "postgresql://postgres.zwgeerzhxypxljlgseig:appliedinsights2202@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",

  ssl: { rejectUnauthorized: false },
});

setInterval(() => {
  pool.query("SELECT 1").catch((err) => {
    console.log(err);
  });
  console.log("Querry sended");
}, 60 * 60 * 1000);

module.exports = pool;
