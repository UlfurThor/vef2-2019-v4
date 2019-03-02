require('dotenv').config();

const fs = require('fs');
const util = require('util');

const { query } = require('./db');

const connectionString = process.env.DATABASE_URL;

const readFileAsync = util.promisify(fs.readFile);

const dbPre = '  DB> ';

async function main() {
  console.info(`${dbPre}Create db at ${connectionString}`);
  await query('DROP TABLE IF EXISTS todos');
  console.info(`${dbPre}Table droped`);

  try {
    const createTable = await readFileAsync('./schema.sql');
    await query(createTable.toString('utf8'));
    console.info(`${dbPre}Table created`);
  } catch (e) {
    console.error(`${dbPre} --- ERROR CREATING TABLE:`, e.message);
    return;
  }

  try {
    const insert = await readFileAsync('./insert.sql');
    await query(insert.toString('utf8'));
    console.info(`${dbPre}Data added`);
  } catch (e) {
    console.error(`${dbPre} --- ERROR ADDING DATA:`, e.message);
  }
}

main().catch((err) => {
  console.error(err);
});
