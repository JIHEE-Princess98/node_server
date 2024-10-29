const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database:process.env.DATABASE,
    password: process.env.PASSWORD,
    port:process.env.PORT,
    schema:process.env.SCHMAS,
});

pool.connect((err) => {
    if(err) throw err;
    console.log('pg db connect!');
});

const tableQuery = "SET search_path TO 'node'";
pool.query(tableQuery, (err, rows, fields) => {
    if(err) console.log(err);
    console.log("GET Schema!");
});

module.exports = pool;
