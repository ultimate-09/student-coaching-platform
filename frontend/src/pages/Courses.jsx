import { useEffect, useState } from 'react'
import CourseCard from '../components/CourseCard'
import api from '../api/axios'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/courses')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.courses ?? []
        setCourses(data)
        setFiltered(data)
      })
      .catch(() => setError('Kurslar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(courses)
    } else {
      const q = search.toLowerCase()
      setFiltered(
        courses.filter(
          c =>
            c.title?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            c.teacher_name?.toLowerCase().includes(q)
        )
      )
    }
  }, [search, courses])

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">📚 Tüm Kurslar</h1>
            <p className="page-subtitle">
              {loading ? 'Yükleniyor...' : `${filtered.length} kurs bulundu`}
            </p>
          </div>

          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              placeholder="Kurs veya eğitmen ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Kurs ara"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner lg" />
            <span>Kurslar yükleniyor...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <p className="empty-state-title">
              {search ? 'Arama sonucu bulunamadı' : 'Henüz kurs bulunmuyor'}
            </p>
            <p className="empty-state-desc">
              {search
                ? `"${search}" için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
                : 'Yakında yeni kurslar eklenecek!'}
            </p>
            {search && (
              <button className="btn btn-outline" onClick={() => setSearch('')}>
                Aramayı Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
