const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const dataDir = path.join(__dirname, 'data')
const dbFile = path.join(dataDir, 'app.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbFile)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    duration TEXT,
    teacher_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    course_title TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  );
`)

const seedCourses = [
  ['Zaman Yönetimi', 'Etkili zaman yönetimi teknikleri', 0, '3 saat', 'Ayşe Yılmaz'],
  ['Sınav Stratejileri', 'Yüksek başarı için stratejiler', 199, '6 saat', 'Mehmet Demir'],
  ['Kariyer Planlama', 'Kariyer hedefleri ve planlama', 299, '4 saat', 'Selin Kaya'],
]

const courseCount = db.prepare('SELECT COUNT(*) AS count FROM courses').get().count
if (courseCount === 0) {
  const insertCourse = db.prepare(
    'INSERT INTO courses (title, description, price, duration, teacher_name) VALUES (?, ?, ?, ?, ?)'
  )

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertCourse.run(...row)
    }
  })

  insertMany(seedCourses)
}

function listCourses() {
  return db.prepare('SELECT * FROM courses ORDER BY id ASC').all()
}

function getCourseById(id) {
  return db.prepare('SELECT * FROM courses WHERE id = ?').get(id)
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

function createUser({ name, email, passwordHash, role = 'student' }) {
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, passwordHash, role)

  return getUserById(result.lastInsertRowid)
}

function updateUserName(id, name) {
  db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, id)
  return getUserById(id)
}

function updateUserPassword(id, passwordHash) {
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, id)
  return getUserById(id)
}

function createPayment({ userId, courseId, courseTitle, amount, status = 'completed' }) {
  const result = db.prepare(
    'INSERT INTO payments (user_id, course_id, course_title, amount, status) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, courseId, courseTitle, amount, status)

  return db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid)
}

function listPaymentsByUser(userId) {
  return db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC').all(userId)
}

module.exports = {
  db,
  listCourses,
  getCourseById,
  getUserByEmail,
  getUserById,
  createUser,
  updateUserName,
  updateUserPassword,
  createPayment,
  listPaymentsByUser,
}
