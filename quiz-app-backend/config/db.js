const { Pool } = require("pg");

const pool = new Pool({

  connectionString:
    // "postgresql://postgres:Appliedinsights%402202@db.zwgeerzhxypxljlgseig.supabase.co:5432/postgres",
    "postgresql://postgres.zwgeerzhxypxljlgseig:appliedinsights2202@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",

  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
