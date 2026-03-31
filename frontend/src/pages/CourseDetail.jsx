import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

export default function CourseDetail() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(res => setCourse(res.data.course ?? res.data))
      .catch(() => setError('Kurs bulunamadı veya bir hata oluştu.'))
      .finally(() => setLoading(false))
  }, [courseId])

  const handleEnroll = () => {
    if (!user) {
      navigate('/giris')
    } else {
      navigate('/odeme', { state: { course } })
    }
  }

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="loading-spinner lg" />
        <span>Kurs yükleniyor...</span>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">⚠️ {error || 'Kurs bulunamadı.'}</div>
          <Link to="/kurslar" className="btn btn-outline">← Kurslara Dön</Link>
        </div>
      </div>
    )
  }

  const gradient = GRADIENTS[(course.id ?? 0) % GRADIENTS.length]
  const formattedPrice = course.price != null
    ? Number(course.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
    : 'Ücretsiz'

  return (
    <div className="course-detail-page">
      {/* Hero Banner */}
      <div className="course-hero" style={{ background: gradient }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Ana Sayfa</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/kurslar" style={{ color: 'rgba(255,255,255,0.7)' }}>Kurslar</Link>
            <span className="breadcrumb-sep">/</span>
            <span style={{ color: '#fff' }}>{course.title}</span>
          </div>

          <div className="course-hero-inner">
            <h1 className="course-hero-title">{course.title}</h1>
            <div className="course-hero-meta">
              {course.teacher_name && (
                <span className="course-hero-meta-item">
                  👨‍🏫 {course.teacher_name}
                </span>
              )}
              {course.duration && (
                <span className="course-hero-meta-item">
                  🕐 {course.duration}
                </span>
              )}
              <span className="badge badge-secondary" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                📚 Online Kurs
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-detail-grid">
          {/* Main Content */}
          <div className="course-detail-main">
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 className="course-section-title">Kurs Hakkında</h2>
              <p className="course-description-text">
                {course.description || 'Bu kurs hakkında detaylı bilgi yakında eklenecektir.'}
              </p>
            </section>

            {course.teacher_name && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 className="course-section-title">Eğitmen</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {course.teacher_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{course.teacher_name}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Uzman Eğitmen</p>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="course-section-title">Bu Kursta Neler Öğreneceksiniz?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                {[
                  'Konuya özel temel kavramlar',
                  'Uygulamalı projeler',
                  'Gerçek dünya senaryoları',
                  'Uzman ipuçları ve stratejiler',
                  'Sektör standartları',
                  'Kariyer rehberliği',
                ].map((item, i) => (
                  <div key={i} className="course-includes-item">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="course-sidebar-card">
              <div className="course-sidebar-preview" style={{ background: gradient }}>
                📚
              </div>
              <div className="course-sidebar-body">
                <div className="course-sidebar-price">{formattedPrice}</div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleEnroll}
                  style={{ marginBottom: '0.875rem' }}
                >
                  {user ? '🎓 Kursa Kaydol' : '🔐 Giriş Yap & Kaydol'}
                </button>

                {!user && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', textAlign: 'center', marginBottom: '1rem' }}>
                    Kayıt olmak için giriş yapmanız gerekmektedir.
                  </p>
                )}

                <div className="course-includes">
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Bu kurs şunları içerir:</p>
                  {course.duration && (
                    <div className="course-includes-item">
                      {course.duration} içerik
                    </div>
                  )}
                  <div className="course-includes-item">Ömür boyu erişim</div>
                  <div className="course-includes-item">Mobil ve masaüstü erişim</div>
                  <div className="course-includes-item">Tamamlama sertifikası</div>
                  <div className="course-includes-item">Uzman desteği</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to="/kurslar" className="btn btn-ghost btn-sm">
                ← Tüm Kurslara Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
