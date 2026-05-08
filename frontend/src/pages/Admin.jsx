import { useState, useEffect } from 'react'
import api from '../api/axios'
import '../styles/admin.css'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    teacher_name: ''
  })
  const [editingCourse, setEditingCourse] = useState(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'stats') {
        const res = await api.get('/admin/stats')
        setStats(res.data)
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users')
        setUsers(res.data)
      } else if (activeTab === 'payments') {
        const res = await api.get('/admin/payments')
        setPayments(res.data)
      } else if (activeTab === 'courses') {
        const res = await api.get('/courses')
        setCourses(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    if (!newCourse.title || !newCourse.description) {
      setError('Title ve description gerekli')
      return
    }

    try {
      await api.post('/admin/courses', newCourse)
      setNewCourse({
        title: '',
        description: '',
        price: 0,
        duration: '',
        teacher_name: ''
      })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Kurs eklenemedi')
    }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Kursu silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/admin/courses/${id}`)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Kurs silinemedi')
    }
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admin/courses/${editingCourse.id}`, editingCourse)
      setEditingCourse(null)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Kurs güncellenemedi')
    }
  }

  return (
    <div className="admin-container">
      <h1>Admin Paneli</h1>
      
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          İstatistikler
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Kullanıcılar
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Ödemeler
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Kurslar
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Yükleniyor...</div>}

      {!loading && activeTab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Toplam Öğrenci</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Toplam Kurs</h3>
            <p className="stat-number">{stats.totalCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Toplam Gelir</h3>
            <p className="stat-number">₺{stats.totalRevenue}</p>
          </div>
          <div className="stat-card">
            <h3>Toplam Ödeme</h3>
            <p className="stat-number">{stats.totalPayments}</p>
          </div>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="table-container">
          <h2>Kullanıcılar ({users.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Katılım Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'payments' && (
        <div className="table-container">
          <h2>Ödemeler ({payments.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kurs</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.course_title}</td>
                  <td>₺{payment.amount}</td>
                  <td>{payment.status}</td>
                  <td>{new Date(payment.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeTab === 'courses' && (
        <div className="courses-section">
          <h2>Kursları Yönet</h2>
          
          <div className="add-course-form">
            <h3>{editingCourse ? 'Kursu Düzenle' : 'Yeni Kurs Ekle'}</h3>
            <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}>
              <input
                type="text"
                placeholder="Kurs Başlığı"
                value={editingCourse ? editingCourse.title : newCourse.title}
                onChange={(e) => editingCourse 
                  ? setEditingCourse({...editingCourse, title: e.target.value})
                  : setNewCourse({...newCourse, title: e.target.value})
                }
              />
              <textarea
                placeholder="Kurs Açıklaması"
                value={editingCourse ? editingCourse.description : newCourse.description}
                onChange={(e) => editingCourse
                  ? setEditingCourse({...editingCourse, description: e.target.value})
                  : setNewCourse({...newCourse, description: e.target.value})
                }
              />
              <input
                type="number"
                placeholder="Fiyat (₺)"
                value={editingCourse ? editingCourse.price : newCourse.price}
                onChange={(e) => editingCourse
                  ? setEditingCourse({...editingCourse, price: e.target.value})
                  : setNewCourse({...newCourse, price: e.target.value})
                }
              />
              <input
                type="text"
                placeholder="Süre (örn: 6 saat)"
                value={editingCourse ? editingCourse.duration : newCourse.duration}
                onChange={(e) => editingCourse
                  ? setEditingCourse({...editingCourse, duration: e.target.value})
                  : setNewCourse({...newCourse, duration: e.target.value})
                }
              />
              <input
                type="text"
                placeholder="Öğretmen Adı"
                value={editingCourse ? editingCourse.teacher_name : newCourse.teacher_name}
                onChange={(e) => editingCourse
                  ? setEditingCourse({...editingCourse, teacher_name: e.target.value})
                  : setNewCourse({...newCourse, teacher_name: e.target.value})
                }
              />
              <button type="submit">{editingCourse ? 'Güncelle' : 'Ekle'}</button>
              {editingCourse && (
                <button type="button" onClick={() => setEditingCourse(null)}>
                  İptal
                </button>
              )}
            </form>
          </div>

          <div className="courses-list">
            <h3>Mevcut Kurslar ({courses.length})</h3>
            {courses.map(course => (
              <div key={course.id} className="course-item">
                <div>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <small>₺{course.price} • {course.duration} • {course.teacher_name}</small>
                </div>
                <div className="course-actions">
                  <button
                    className="btn-edit"
                    onClick={() => setEditingCourse(course)}
                  >
                    Düzenle
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
