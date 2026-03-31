import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import api from '../api/axios'

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        const courses = Array.isArray(res.data) ? res.data : res.data.courses ?? []
        setFeaturedCourses(courses.slice(0, 3))
      })
      .catch(() => setFeaturedCourses([]))
      .finally(() => setLoadingCourses(false))
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              🚀 Türkiye'nin #1 Koçluk Platformu
            </div>
            <h1 className="hero-title">
              Hedeflerine Ulaş,<br />
              <span>Başarını Artır</span>
            </h1>
            <p className="hero-subtitle">
              Alanında uzman koçlarla birebir çalış, kendi hızında öğren ve kariyerinde fark yarat. Her seviyeye uygun kurslarla seni bekliyor.
            </p>
            <div className="hero-actions">
              <Link to="/kurslar" className="btn btn-secondary btn-lg">
                📚 Kurslara Gözat
              </Link>
              <Link to="/kayit" className="btn btn-outline-white btn-lg">
                🎯 Hemen Başla
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Neden EduCoach?</h2>
            <p className="section-subtitle">
              Size en iyi öğrenme deneyimini sunmak için tasarlandık.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3 className="feature-title">Uzman Koçlar</h3>
              <p className="feature-desc">
                Alanlarında yıllarca deneyim kazanmış, seçkin uzman eğitmenlerle çalış. Her koçumuz titizlikle seçilmiştir.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3 className="feature-title">Esnek Eğitim</h3>
              <p className="feature-desc">
                İstediğin yerden, istediğin zaman öğren. Mobil uyumlu platformumuz ile eğitim hayatın boyunca seninle.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎯</span>
              <h3 className="feature-title">Kişisel Gelişim</h3>
              <p className="feature-desc">
                Sana özel hazırlanmış öğrenme yolları ve kişiselleştirilmiş koçluk seanslarıyla hedefe daha hızlı ulaş.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Mutlu Öğrenci</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Farklı Kurs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">%98</span>
              <span className="stat-label">Memnuniyet Oranı</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Öne Çıkan Kurslar</h2>
            <p className="section-subtitle">
              En popüler kurslarımızla öğrenmeye hemen başla.
            </p>
          </div>

          {loadingCourses ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <span>Kurslar yükleniyor...</span>
            </div>
          ) : featuredCourses.length > 0 ? (
            <>
              <div className="courses-grid">
                {featuredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link to="/kurslar" className="btn btn-outline btn-lg">
                  Tüm Kursları Gör →
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">📚</span>
              <p className="empty-state-title">Henüz kurs bulunmuyor</p>
              <p className="empty-state-desc">Yakında yeni kurslar eklenecek!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section-alt">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">Hemen Öğrenmeye Başla</h2>
            <p className="cta-subtitle">
              Binlerce öğrenciye katıl ve kariyerinde bir adım öne geç. Ücretsiz kayıt ol, ilk dersini bugün al.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/kayit" className="btn btn-primary btn-lg">
                Ücretsiz Kayıt Ol 🎉
              </Link>
              <Link to="/kurslar" className="btn btn-outline btn-lg">
                Kurslara Göz At
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
