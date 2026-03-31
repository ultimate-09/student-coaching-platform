import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = form

    if (!name || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await register(name, email, password)
      setSuccess('Kayıt işleminiz başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => navigate('/giris'), 2000)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1 className="auth-title">Hesap Oluştur</h1>
          <p className="auth-subtitle">EduCoach'a katıl ve öğrenmeye başla.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Ad Soyad</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="Adınız ve soyadınız"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <span className="form-hint">Şifreniz en az 6 karakter içermelidir.</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              placeholder="Şifrenizi tekrar girin"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !!success}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <>
                <span className="loading-spinner sm" style={{ borderTopColor: '#fff' }} />
                Kayıt yapılıyor...
              </>
            ) : (
              '✨ Kayıt Ol'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Zaten hesabın var mı?{' '}
          <Link to="/giris">Giriş Yap</Link>
        </div>
      </div>
    </div>
  )
}
