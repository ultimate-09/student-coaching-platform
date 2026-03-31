import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const MOCK_COURSES = [
  { id: 1, title: 'İleri Seviye Matematik', progress: 65, emoji: '📐' },
  { id: 2, title: 'Üniversite Sınav Hazırlık', progress: 40, emoji: '📝' },
  { id: 3, title: 'Türkçe Kompozisyon', progress: 88, emoji: '✍️' },
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(amount) {
  return Number(amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(true)

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  useEffect(() => {
    api.get('/payments/history')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.payments ?? []
        setPayments(data)
      })
      .catch(() => setPayments([]))
      .finally(() => setLoadingPayments(false))
  }, [])

  const completedCourses = MOCK_COURSES.filter(c => c.progress === 100).length
  const activeCourses = MOCK_COURSES.filter(c => c.progress < 100).length
  const totalLessons = MOCK_COURSES.reduce((acc, c) => acc + Math.round((c.progress / 100) * 12), 0)

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            Merhaba, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="dashboard-date">{today}</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-icon primary">📚</div>
            <div className="stat-card-info">
              <div className="stat-card-value">{MOCK_COURSES.length}</div>
              <div className="stat-card-label">Kayıtlı Kurs</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon secondary">✅</div>
            <div className="stat-card-info">
              <div className="stat-card-value">{completedCourses}</div>
              <div className="stat-card-label">Tamamlanan</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon warning">🎯</div>
            <div className="stat-card-info">
              <div className="stat-card-value">{totalLessons}</div>
              <div className="stat-card-label">Ders Tamamlandı</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon danger">💳</div>
            <div className="stat-card-info">
              <div className="stat-card-value">{payments.length}</div>
              <div className="stat-card-label">Ödeme Geçmişi</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Enrolled Courses */}
          <div>
            <h2 className="section-heading">📖 Devam Eden Kurslarım</h2>
            <div className="enrolled-courses-list">
              {MOCK_COURSES.map(course => (
                <div key={course.id} className="enrolled-course-item">
                  <div className="enrolled-course-emoji">
                    {course.emoji}
                  </div>
                  <div className="enrolled-course-info">
                    <div className="enrolled-course-title">{course.title}</div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="enrolled-course-pct">
                      %{course.progress} tamamlandı
                    </div>
                  </div>
                  <Link to={`/kurslar/${course.id}`} className="btn btn-ghost btn-sm">
                    Devam →
                  </Link>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/kurslar" className="btn btn-outline btn-sm">
                + Yeni Kurs Bul
              </Link>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h2 className="section-heading">💳 Son Ödemeler</h2>
            <div className="card">
              {loadingPayments ? (
                <div className="loading-container" style={{ padding: '2rem' }}>
                  <div className="loading-spinner" />
                </div>
              ) : payments.length === 0 ? (
                <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                  <span className="empty-state-icon">💳</span>
                  <p className="empty-state-title">Henüz ödeme yok</p>
                  <p className="empty-state-desc">
                    Bir kursa kaydolduğunuzda ödemeleriniz burada görünecek.
                  </p>
                </div>
              ) : (
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Kurs</th>
                      <th>Tarih</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 5).map((p, i) => (
                      <tr key={p.id ?? i}>
                        <td>{p.course_title ?? p.courseName ?? `Kurs #${p.course_id ?? i + 1}`}</td>
                        <td>{formatDate(p.created_at ?? p.date)}</td>
                        <td style={{ fontWeight: 600 }}>
                          {formatCurrency(p.amount ?? p.price ?? 0)}
                        </td>
                        <td>
                          <span className={`badge ${p.status === 'success' || p.status === 'completed' ? 'badge-secondary' : 'badge-warning'}`}>
                            {p.status === 'success' || p.status === 'completed' ? 'Başarılı' : 'Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 className="section-heading">⚡ Hızlı Erişim</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/kurslar" className="btn btn-primary">
              📚 Kurslara Gözat
            </Link>
            <Link to="/profil" className="btn btn-outline">
              👤 Profilimi Düzenle
            </Link>
            <Link to="/odeme" className="btn btn-secondary">
              💳 Ödeme Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
