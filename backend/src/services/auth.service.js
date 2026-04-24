const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const VALID_ROLES = ['patient', 'staff', 'admin'];
const SALT_ROUNDS = 10;

const insertUserStmt = db.prepare(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);
const findUserByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');

async function createUser({ name, email, password, role }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = insertUserStmt.run(name, email, hash, role);
  return result.lastInsertRowid;
}

function findUserByEmail(email) {
  return findUserByEmailStmt.get(email);
}

function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

module.exports = {
  VALID_ROLES,
  createUser,
  findUserByEmail,
  verifyPassword,
  signToken,
};
