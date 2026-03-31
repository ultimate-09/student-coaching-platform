const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Mevcut abonelik paketlerini listele
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscription_packages WHERE is_active = true ORDER BY price ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Paketler yüklenemedi!' });
  }
});

// Kendi aboneliğini görüntüle
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, sp.name as package_name, sp.description as package_description
       FROM subscriptions s
       JOIN subscription_packages sp ON s.package_id = sp.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ subscription: null });
    }

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Abonelik bilgisi yüklenemedi!' });
  }
});

// Yeni abonelik oluştur (ödeme öncesi)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: 'Paket ID zorunludur!' });
    }

    // Paket var mı?
    const packageResult = await pool.query(
      'SELECT * FROM subscription_packages WHERE id = $1 AND is_active = true',
      [packageId]
    );

    if (packageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paket bulunamadı!' });
    }

    const pkg = packageResult.rows[0];

    // Bekleyen abonelik oluştur
    const result = await pool.query(
      'INSERT INTO subscriptions (user_id, package_id, status, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, packageId, 'pending', pkg.price]
    );

    res.status(201).json({
      message: 'Abonelik oluşturuldu, ödeme bekleniyor.',
      subscription: result.rows[0],
      package: pkg
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Abonelik oluşturulamadı!' });
  }
});

// Aboneliği iptal et
router.put('/:subscriptionId/cancel', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const check = await pool.query(
      'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
      [subscriptionId, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Abonelik bulunamadı!' });
    }

    if (check.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Abonelik zaten iptal edilmiş!' });
    }

    const result = await pool.query(
      'UPDATE subscriptions SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', subscriptionId]
    );

    res.json({ message: 'Abonelik iptal edildi.', subscription: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Abonelik iptal edilemedi!' });
  }
});

module.exports = router;
