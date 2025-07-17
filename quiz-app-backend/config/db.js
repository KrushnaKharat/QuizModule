const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Krishaa@2904",
  database: "quiz_app",
});
connection.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected!");
});
module.exports = connection;
