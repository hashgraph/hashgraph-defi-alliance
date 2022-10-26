import { DB, DB_HOST, DB_PASSWORD, DB_USER } from "../utils/config.js";
import mysql from "mysql2";

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  database: DB,
  password: DB_PASSWORD
});

export default pool.promise();
