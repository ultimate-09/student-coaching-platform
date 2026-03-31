import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <span className="nav-brand-emoji">🎓</span>
          EduCoach
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links" style={{ display: 'flex' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Ana Sayfa
          </NavLink>
          <NavLink
            to="/kurslar"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Kurslar
          </NavLink>
          {user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth" style={{ display: 'flex' }}>
          {user ? (
            <>
              <span className="nav-user-name">👋 {user.name}</span>
              <NavLink
                to="/profil"
                className={({ isActive }) => `btn btn-ghost btn-sm${isActive ? ' active' : ''}`}
              >
                Profil
              </NavLink>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/giris" className="btn btn-ghost btn-sm">
                Giriş Yap
              </Link>
              <Link to="/kayit" className="btn btn-primary btn-sm">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menüyü aç/kapat"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu${menuOpen ? ' open' : ''}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          onClick={closeMenu}
        >
          🏠 Ana Sayfa
        </NavLink>
        <NavLink
          to="/kurslar"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          onClick={closeMenu}
        >
          📚 Kurslar
        </NavLink>
        {user ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              📊 Dashboard
            </NavLink>
            <NavLink
              to="/profil"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              👤 Profil
            </NavLink>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <Link to="/giris" className="btn btn-outline btn-sm" onClick={closeMenu}>
              Giriş Yap
            </Link>
            <Link to="/kayit" className="btn btn-primary btn-sm" onClick={closeMenu}>
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
