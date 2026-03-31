import { Link } from 'react-router-dom'

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

function getGradient(id) {
  return GRADIENTS[(id ?? 0) % GRADIENTS.length]
}

export default function CourseCard({ course }) {
  const { id, title, description, price, duration, teacher_name } = course

  const formattedPrice =
    price != null
      ? Number(price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
      : 'Ücretsiz'

  return (
    <article className="course-card">
      <div
        className="course-image"
        style={{ background: getGradient(id) }}
        aria-hidden="true"
      >
        📚
      </div>

      <div className="course-body">
        <h3 className="course-title" title={title}>
          {title}
        </h3>

        {description && (
          <p className="course-description">{description}</p>
        )}

        <div className="course-meta">
          {teacher_name && (
            <span className="course-teacher">
              👨‍🏫 {teacher_name}
            </span>
          )}
          {duration && (
            <span className="badge badge-gray">
              🕐 {duration}
            </span>
          )}
        </div>

        <div className="course-footer">
          <span className={price ? 'course-price' : 'course-price-free'}>
            {formattedPrice}
          </span>
          <Link to={`/kurslar/${id}`} className="btn btn-primary btn-sm">
            Detayları Gör
          </Link>
        </div>
      </div>
    </article>
  )
}
