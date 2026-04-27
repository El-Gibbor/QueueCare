const path = require('path');
const Database = require('better-sqlite3');

const defaultDbPath = path.join(__dirname, '..', '..', 'queuecare.db');
const db = new Database(process.env.DB_PATH || defaultDbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    role      TEXT    NOT NULL DEFAULT 'patient'
              CHECK(role IN ('patient', 'staff', 'admin')),
    createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId   INTEGER NOT NULL REFERENCES users(id),
    doctorName  TEXT    NOT NULL,
    reason      TEXT    NOT NULL,
    date        TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'scheduled'
                CHECK(status IN ('scheduled', 'served', 'cancelled')),
    queueNumber INTEGER NOT NULL,
    createdAt   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
