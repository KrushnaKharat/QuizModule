const { Pool } = require("pg");

const pool = new Pool({
  connectionString: 
  "postgresql://postgres.zwgeerzhxypxljlgseig:Appliedinsights%402202@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
