import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Profile() {
  const { user, updateUser } = useAuth()

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  const handleProfileChange = (e) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setProfileError('')
    setProfileSuccess('')
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) {
      setProfileError('İsim alanı boş bırakılamaz.')
      return
    }
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const res = await api.put('/auth/profile', { name: profileForm.name })
      updateUser(res.data.user ?? { name: profileForm.name })
      setProfileSuccess('Profil bilgileri başarıyla güncellendi.')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Profil güncellenirken bir hata oluştu.'
      setProfileError(msg)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePwChange = (e) => {
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPwError('')
    setPwSuccess('')
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = pwForm
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Lütfen tüm şifre alanlarını doldurun.')
      return
    }
    if (newPassword.length < 6) {
      setPwError('Yeni şifre en az 6 karakter olmalıdır.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Yeni şifreler eşleşmiyor.')
      return
    }
    setPwLoading(true)
    setPwError('')
    setPwSuccess('')
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
      setPwSuccess('Şifreniz başarıyla değiştirildi.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Şifre değiştirilirken bir hata oluştu.'
      setPwError(msg)
    } finally {
      setPwLoading(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">👤 Profilim</h1>
          <p className="page-subtitle">Hesap bilgilerini görüntüle ve düzenle.</p>
        </div>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar">{initials}</div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>

            <div className="profile-stats-list">
              <div className="profile-stat-item">
                <span className="profile-stat-label">📚 Kayıtlı Kurs</span>
                <span className="profile-stat-value">3</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">✅ Tamamlanan</span>
                <span className="profile-stat-value">0</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">🎖️ Sertifika</span>
                <span className="profile-stat-value">0</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">📅 Üyelik</span>
                <span className="profile-stat-value">
                  {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="profile-main">
            {/* Edit Profile */}
            <div className="form-section">
              <div className="form-section-header">
                ✏️ Profil Bilgilerini Düzenle
              </div>
              <div className="form-section-body">
                {profileError && <div className="alert alert-error">⚠️ {profileError}</div>}
                {profileSuccess && <div className="alert alert-success">✅ {profileSuccess}</div>}

                <form onSubmit={handleProfileSubmit} noValidate>
                  <div className="form-group">
                    <label htmlFor="name">Ad Soyad</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Adınız ve soyadınız"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-posta Adresi</label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      value={user?.email ?? ''}
                      disabled
                      style={{ background: 'var(--color-bg)', cursor: 'not-allowed' }}
                    />
                    <span className="form-hint">E-posta adresi değiştirilemez.</span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <>
                        <span className="loading-spinner sm" style={{ borderTopColor: '#fff' }} />
                        Kaydediliyor...
                      </>
                    ) : (
                      '💾 Değişiklikleri Kaydet'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div className="form-section">
              <div className="form-section-header">
                🔒 Şifre Değiştir
              </div>
              <div className="form-section-body">
                {pwError && <div className="alert alert-error">⚠️ {pwError}</div>}
                {pwSuccess && <div className="alert alert-success">✅ {pwSuccess}</div>}

                <form onSubmit={handlePwSubmit} noValidate>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Mevcut Şifre</label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className="form-control"
                      placeholder="Mevcut şifreniz"
                      value={pwForm.currentPassword}
                      onChange={handlePwChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Yeni Şifre</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="form-control"
                      placeholder="En az 6 karakter"
                      value={pwForm.newPassword}
                      onChange={handlePwChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Yeni Şifre Tekrar</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="form-control"
                      placeholder="Yeni şifrenizi tekrar girin"
                      value={pwForm.confirmPassword}
                      onChange={handlePwChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={pwLoading}
                  >
                    {pwLoading ? (
                      <>
                        <span className="loading-spinner sm" style={{ borderTopColor: '#fff' }} />
                        Güncelleniyor...
                      </>
                    ) : (
                      '🔑 Şifreyi Güncelle'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Account Info */}
            <div className="form-section">
              <div className="form-section-header">
                ℹ️ Hesap Bilgileri
              </div>
              <div className="form-section-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Ad Soyad</p>
                    <p style={{ fontWeight: 600 }}>{user?.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>E-posta</p>
                    <p style={{ fontWeight: 600 }}>{user?.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Hesap Türü</p>
                    <span className="badge badge-primary">{user?.role === 'teacher' ? '👨‍🏫 Eğitmen' : '🎓 Öğrenci'}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: '0.25rem' }}>Hesap Durumu</p>
                    <span className="badge badge-secondary">✅ Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
