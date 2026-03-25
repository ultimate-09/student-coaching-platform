const express = require('express');
const router = express.Router();
const iyzico = require('../config/iyzico');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Ödeme oluştur
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { subscriptionId, amount, cardHolderName, cardNumber, expireMonth, expireYear, cvc } = req.body;
    const userId = req.user.id;

    // Kullanıcı bilgisini al
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Ödeme isteği oluştur
    const paymentRequest = {
      locale: 'tr',
      conversationId: `payment_${userId}_${Date.now()}`,
      price: amount.toString(),
      paidPrice: amount.toString(),
      currency: 'TRY',
      installment: '1',
      basketId: `basket_${userId}`,
      paymentChannel: 'WEB',
      paymentGroup: 'SUBSCRIPTION',
      paymentCard: {
        cardHolderName: cardHolderName,
        cardNumber: cardNumber,
        expireMonth: expireMonth,
        expireYear: expireYear,
        cvc: cvc
      },
      buyer: {
        id: userId.toString(),
        name: user.name.split(' ')[0],
        surname: user.name.split(' ')[1] || '',
        gsmNumber: user.phone || '',
        email: user.email,
        identityNumber: '12345678901',
        registrationAddress: 'Adres',
        city: 'İstanbul',
        country: 'Türkiye',
        zipCode: '34000'
      },
      shippingAddress: {
        contactName: user.name,
        city: 'İstanbul',
        country: 'Türkiye',
        address: 'Adres',
        zipCode: '34000'
      },
      billingAddress: {
        contactName: user.name,
        city: 'İstanbul',
        country: 'Türkiye',
        address: 'Adres',
        zipCode: '34000'
      },
      basketItems: [
        {
          id: subscriptionId.toString(),
          name: `Subscription Package`,
          category1: 'SUBSCRIPTION',
          itemType: 'VIRTUAL',
          price: amount.toString()
        }
      ]
    };

    // İyzico API'ye gönder
    iyzico.payment.create(paymentRequest, async (err, result) => {
      if (err) {
        console.error('İyzico hatası:', err);
        return res.status(400).json({ 
          success: false, 
          message: 'Ödeme işlemi başarısız' 
        });
      }

      if (result.status === 'success') {
        // Ödemeyi veritabanına kaydet
        const paymentResult = await pool.query(
          'INSERT INTO payments (user_id, subscription_id, amount, status, iyzico_id, payment_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [userId, subscriptionId, amount, 'completed', result.paymentId, JSON.stringify(result)]
        );

        // Kullanıcının subscription'ını güncelle
        await pool.query(
          'UPDATE subscriptions SET status = $1, payment_id = $2 WHERE id = $3',
          ['active', paymentResult.rows[0].id, subscriptionId]
        );

        res.json({ 
          success: true, 
          message: 'Ödeme başarılı',
          payment: paymentResult.rows[0]
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.errorMessage || 'Ödeme başarısız'
        });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Ödeme işlemi sırasında hata oluştu' 
    });
  }
});

// Ödeme geçmişi
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ 
      success: true, 
      payments: result.rows 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Ödeme geçmişi alınamadı' 
    });
  }
});

module.exports = router;