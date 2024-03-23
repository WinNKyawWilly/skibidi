const mysql = require("mysql2");
const BaseSQLModel = require("./baseSQLModel");

let config = {
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "root",
  database: "skibidi_book",
};

exports.dbconfig = config;

//const db_conn = mysql.createConnection(config);

exports.dbconnect = mysql.createConnection(config);

//module.exports = db_conn;
