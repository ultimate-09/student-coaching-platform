const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {
  listCourses,
  getCourseById,
  getUserByEmail,
  getUserById,
  createUser,
  updateUserName,
  updateUserPassword,
  createPayment,
  listPaymentsByUser,
  listAllUsers,
  listAllPayments,
  createCourse,
  updateCourse,
  deleteCourse,
  getStats,
} = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change'

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'Token bulunamadı' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Geçersiz token formatı' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' })
  }
}

function adminCheck(req, res, next) {
  const user = getUserById(req.user.id)
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin yetkisi gerekli' })
  }
  next()
}

// Routes
app.get('/api/courses', (req, res) => {
  res.json(listCourses())
})

app.get('/api/courses/:id', (req, res) => {
  const id = Number(req.params.id)
  const course = getCourseById(id)
  if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' })
  res.json(course)
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Eksik alan' })
  const normalizedEmail = email.toLowerCase()
  const exists = getUserByEmail(normalizedEmail)
  if (exists) return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı' })
  const hash = await bcrypt.hash(password, 10)
  const user = createUser({ name, email: normalizedEmail, passwordHash: hash })
  res.status(201).json({ message: 'Kayıt başarılı' })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Eksik alan' })
  const user = getUserByEmail(email.toLowerCase())
  if (!user) return res.status(401).json({ message: 'E-posta veya şifre hatalı' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'E-posta veya şifre hatalı' })
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

app.get('/api/me', authenticateToken, (req, res) => {
  const user = getUserById(req.user.id)
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Ad soyad zorunludur' })
  }

  const user = getUserById(req.user.id)
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' })

  const updatedUser = updateUserName(user.id, name.trim())
  res.json({ message: 'Profil güncellendi', user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role } })
})

app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Eksik alan' })
  }

  const user = getUserById(req.user.id)
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' })

  const ok = await bcrypt.compare(currentPassword, user.password_hash)
  if (!ok) {
    return res.status(401).json({ message: 'Mevcut şifre hatalı' })
  }

  updateUserPassword(user.id, await bcrypt.hash(newPassword, 10))
  res.json({ message: 'Şifre güncellendi' })
})

app.post('/api/payments/create', authenticateToken, (req, res) => {
  const courseId = Number(req.body.courseId ?? req.body.subscriptionId)
  const amount = Number(req.body.amount ?? 0)
  const card = req.body.paymentCard ?? req.body

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'Kurs seçimi gerekli' })
  }

  const course = getCourseById(courseId)
  if (!course) {
    return res.status(404).json({ success: false, message: 'Kurs bulunamadı' })
  }

  if (!card?.cardHolderName || !card?.cardNumber || !card?.expireMonth || !card?.expireYear || !card?.cvc) {
    return res.status(400).json({ success: false, message: 'Kart bilgileri eksik' })
  }

  const payment = createPayment({
    userId: req.user.id,
    courseId: course.id,
    courseTitle: course.title,
    amount: amount || course.price || 0,
    status: 'completed',
  })

  res.json({ success: true, message: 'Ödeme başarılı', payment })
})

app.get('/api/payments/history', authenticateToken, (req, res) => {
  const userPayments = listPaymentsByUser(req.user.id)
  res.json({ success: true, payments: userPayments })
})

// Admin Routes
app.get('/api/admin/stats', authenticateToken, adminCheck, (req, res) => {
  const stats = getStats()
  res.json(stats)
})

app.get('/api/admin/users', authenticateToken, adminCheck, (req, res) => {
  const users = listAllUsers()
  res.json(users)
})

app.get('/api/admin/payments', authenticateToken, adminCheck, (req, res) => {
  const payments = listAllPayments()
  res.json(payments)
})

app.post('/api/admin/courses', authenticateToken, adminCheck, (req, res) => {
  const { title, description, price, duration, teacher_name } = req.body
  if (!title || !description) {
    return res.status(400).json({ message: 'Title ve description gerekli' })
  }
  
  const course = createCourse({
    title,
    description,
    price: Number(price) || 0,
    duration: duration || 'Belirsiz',
    teacher_name: teacher_name || 'Öğretmen'
  })
  
  res.status(201).json(course)
})

app.put('/api/admin/courses/:id', authenticateToken, adminCheck, (req, res) => {
  const courseId = Number(req.params.id)
  const { title, description, price, duration, teacher_name } = req.body
  
  const course = getCourseById(courseId)
  if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' })
  
  const updated = updateCourse(courseId, {
    title: title || course.title,
    description: description || course.description,
    price: price !== undefined ? Number(price) : course.price,
    duration: duration || course.duration,
    teacher_name: teacher_name || course.teacher_name
  })
  
  res.json(updated)
})

app.delete('/api/admin/courses/:id', authenticateToken, adminCheck, (req, res) => {
  const courseId = Number(req.params.id)
  const course = getCourseById(courseId)
  if (!course) return res.status(404).json({ message: 'Kurs bulunamadı' })
  
  deleteCourse(courseId)
  res.json({ message: 'Kurs silindi' })
})

app.listen(PORT, () => {
  console.log(`Backend ready at http://localhost:${PORT}/api`)
})
