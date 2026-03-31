const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Kendi profilini görüntüle
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, bio, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Profil yüklenemedi!' });
  }
});

// Profili güncelle
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone, bio } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), bio = COALESCE($3, bio) WHERE id = $4 RETURNING id, name, email, role, phone, bio',
      [name, phone, bio, req.user.id]
    );

    res.json({ message: 'Profil güncellendi!', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Profil güncellenemedi!' });
  }
});

// Şifre değiştir
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut ve yeni şifre zorunludur!' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Yeni şifre en az 8 karakter olmalıdır!' });
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı!' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Şifre güncellendi!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Şifre güncellenemedi!' });
  }
});

// Öğretmenleri listele
router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, bio FROM users WHERE role = $1 ORDER BY name ASC',
      ['teacher']
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Öğretmenler yüklenemedi!' });
  }
});

module.exports = router;
