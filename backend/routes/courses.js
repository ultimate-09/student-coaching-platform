const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Tüm kursları listeleme
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as teacher_name FROM courses c 
       JOIN users u ON c.teacher_id = u.id 
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Kurslar yüklenemedi!' });
  }
});

// Kurs detayları
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query(
      `SELECT c.*, u.name as teacher_name FROM courses c 
       JOIN users u ON c.teacher_id = u.id 
       WHERE c.id = $1`,
      [courseId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kurs bulunamadı!' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Kurs yüklenemedi!' });
  }
});

// Kursu güncelleme (öğretmen)
router.put('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, price, duration } = req.body;

    // Kursun sahibi olup olmadığını kontrol et
    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kurs bulunamadı!' });
    }

    if (courseCheck.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Bu kursu düzenleme yetkiniz yok!' });
    }

    const result = await pool.query(
      'UPDATE courses SET title = $1, description = $2, price = $3, duration = $4 WHERE id = $5 RETURNING *',
      [title, description, price, duration, courseId]
    );

    res.json({ message: 'Kurs güncellendi!', course: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Güncelleme hatası!' });
  }
});

module.exports = router;