import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2)
  }
  return digits
}

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const course = location.state?.course ?? null

  const [form, setForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const amount = course?.price ?? 0
  const formattedAmount = Number(amount).toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let formatted = value

    if (name === 'cardNumber') {
      formatted = formatCardNumber(value)
    } else if (name === 'cvc') {
      formatted = value.replace(/\D/g, '').slice(0, 4)
    } else if (name === 'expireMonth') {
      formatted = value.replace(/\D/g, '').slice(0, 2)
    } else if (name === 'expireYear') {
      formatted = value.replace(/\D/g, '').slice(0, 4)
    }

    setForm(prev => ({ ...prev, [name]: formatted }))
    setError('')
  }

  const validate = () => {
    const rawCard = form.cardNumber.replace(/\s/g, '')
    if (!form.cardHolderName.trim()) return 'Kart sahibinin adı gereklidir.'
    if (rawCard.length !== 16) return 'Kart numarası 16 haneli olmalıdır.'
    if (!form.expireMonth || Number(form.expireMonth) < 1 || Number(form.expireMonth) > 12)
      return 'Geçerli bir son kullanma ayı girin (01-12).'
    if (!form.expireYear || form.expireYear.length < 4)
      return 'Geçerli bir son kullanma yılı girin.'
    if (!form.cvc || form.cvc.length < 3) return 'CVV/CVC kodu en az 3 haneli olmalıdır.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/payments/create', {
        courseId: course?.id,
        amount,
        paymentCard: {
          cardHolderName: form.cardHolderName,
          cardNumber: form.cardNumber.replace(/\s/g, ''),
          expireMonth: form.expireMonth.padStart(2, '0'),
          expireYear: form.expireYear,
          cvc: form.cvc,
        },
      })
      setSuccess(true)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Ödeme işlemi sırasında bir hata oluştu. Lütfen kart bilgilerinizi kontrol edin.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="payment-page">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ padding: '3rem 2rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Ödeme Başarılı!
            </h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
              {course?.title && <><strong>{course.title}</strong> kursuna başarıyla kaydoldunuz.</>}
            </p>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
              Kurs bilgileri e-posta adresinize gönderilecektir.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                Dashboard'a Git
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/kurslar')}>
                Kurslara Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">💳 Güvenli Ödeme</h1>
          <p className="page-subtitle">
            İyzico altyapısıyla 256-bit SSL şifreleme ile güvenli ödeme yapın.
          </p>
        </div>

        <div className="payment-grid">
          {/* Payment Form */}
          <div className="payment-form-card">
            <div className="payment-form-header">
              <h2 className="payment-form-title">💳 Kart Bilgileri</h2>
            </div>
            <div className="payment-form-body">
              <div className="secure-badge">
                🔒 256-bit SSL Şifreleme ile Güvenli Ödeme
              </div>

              {error && (
                <div className="alert alert-error">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="cardHolderName">Kart Üzerindeki İsim</label>
                  <input
                    id="cardHolderName"
                    name="cardHolderName"
                    type="text"
                    className="form-control"
                    placeholder="AD SOYAD"
                    value={form.cardHolderName}
                    onChange={handleChange}
                    autoComplete="cc-name"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardNumber">Kart Numarası</label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    className="form-control card-number-input"
                    placeholder="0000 0000 0000 0000"
                    value={form.cardNumber}
                    onChange={handleChange}
                    autoComplete="cc-number"
                    inputMode="numeric"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="card-row">
                  <div className="form-group">
                    <label htmlFor="expireMonth">Son Kullanma Ayı</label>
                    <input
                      id="expireMonth"
                      name="expireMonth"
                      type="text"
                      className="form-control"
                      placeholder="AA"
                      value={form.expireMonth}
                      onChange={handleChange}
                      autoComplete="cc-exp-month"
                      inputMode="numeric"
                      maxLength={2}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expireYear">Son Kullanma Yılı</label>
                    <input
                      id="expireYear"
                      name="expireYear"
                      type="text"
                      className="form-control"
                      placeholder="YYYY"
                      value={form.expireYear}
                      onChange={handleChange}
                      autoComplete="cc-exp-year"
                      inputMode="numeric"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cvc">CVV / CVC</label>
                  <input
                    id="cvc"
                    name="cvc"
                    type="text"
                    className="form-control"
                    placeholder="000"
                    value={form.cvc}
                    onChange={handleChange}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    style={{ maxWidth: 120 }}
                  />
                  <span className="form-hint">Kartın arka yüzündeki 3 veya 4 haneli kod</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading}
                  style={{ marginTop: '0.75rem' }}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner sm" style={{ borderTopColor: '#fff' }} />
                      Ödeme işleniyor...
                    </>
                  ) : (
                    `🔐 ${formattedAmount} Öde`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-card">
            <div className="order-summary-header">🧾 Sipariş Özeti</div>
            <div className="order-summary-body">
              {course ? (
                <>
                  <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                      {course.title}
                    </p>
                    {course.teacher_name && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                        👨‍🏫 {course.teacher_name}
                      </p>
                    )}
                  </div>

                  <div className="order-line">
                    <span>Kurs ücreti</span>
                    <span>{formattedAmount}</span>
                  </div>
                  <div className="order-line">
                    <span>İndirim</span>
                    <span style={{ color: 'var(--color-secondary)' }}>₺0,00</span>
                  </div>
                  <div className="order-line order-total">
                    <span>Toplam</span>
                    <span className="order-price">{formattedAmount}</span>
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding: '1.5rem 0.5rem' }}>
                  <span className="empty-state-icon" style={{ fontSize: '2rem' }}>🛒</span>
                  <p className="empty-state-desc">
                    Kurs seçilmedi. Lütfen önce bir kursu seçin.
                  </p>
                </div>
              )}

              <div className="iyzico-badge">
                🔒 iyzico ile güvenli ödeme
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                  ✅ 30 gün iade garantisi
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                  ✅ Ömür boyu erişim
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                  ✅ Sertifika dahil
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
