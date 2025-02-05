import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost", // MySQL host
  user: "root", // MySQL username
  password: "root", // MySQL password
  database: "localbazar", // MySQL database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust pool size as needed
  queueLimit: 0,
});

export default pool;
