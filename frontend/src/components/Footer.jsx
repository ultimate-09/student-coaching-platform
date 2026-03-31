import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              🎓 EduCoach
            </div>
            <p className="footer-tagline">
              Türkiye'nin önde gelen online koçluk platformu. Uzman eğitmenlerle hedeflerine ulaş, kariyerini geliştir.
            </p>
            <div className="footer-social" style={{ marginTop: '1.25rem' }}>
              <a href="#" className="social-btn" aria-label="Twitter">𝕏</a>
              <a href="#" className="social-btn" aria-label="Instagram">IG</a>
              <a href="#" className="social-btn" aria-label="LinkedIn">in</a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Platform</h4>
            <nav className="footer-links">
              <Link to="/kurslar" className="footer-link">Kurslar</Link>
              <Link to="/dashboard" className="footer-link">Dashboard</Link>
              <Link to="/kayit" className="footer-link">Kayıt Ol</Link>
              <Link to="/giris" className="footer-link">Giriş Yap</Link>
            </nav>
          </div>

          <div>
            <h4 className="footer-heading">Kurumsal</h4>
            <nav className="footer-links">
              <a href="#" className="footer-link">Hakkımızda</a>
              <a href="#" className="footer-link">İletişim</a>
              <a href="#" className="footer-link">Gizlilik Politikası</a>
              <a href="#" className="footer-link">Kullanım Koşulları</a>
              <a href="#" className="footer-link">KVKK Aydınlatma</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {currentYear} EduCoach. Tüm hakları saklıdır.</span>
          <span>🇹🇷 Türkiye'de geliştirildi</span>
        </div>
      </div>
    </footer>
  )
}
