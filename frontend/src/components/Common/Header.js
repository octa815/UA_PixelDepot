// src/components/Common/Header.js
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css'; // Usa CSS Modules
import logo from '../../assets/logo.png'; // Asegúrate que la ruta sea correcta
import UserMenu from '../User/UserMenu'; // Componente para el menú de usuario

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Limpia después de buscar
    }
  };

  // Cierra el menú de usuario si se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
   const closeMobileMenu = () => setIsMobileMenuOpen(false);
   const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.logoLink}>
            <img src={logo} alt="MoLaMaZoGAMES Logo" className={styles.logo} />
            <span className={styles.logoText}>PixelDepot</span> {/* Nombre opcional */}
          </Link>
          {/* Navegación para pantallas grandes */}
          <nav className={styles.mainNav}>
            {/* <Link to="/" className={styles.navLink}>Inicio</Link> */}
            <Link to="/browse" className={styles.navLink}>Explorar assets</Link>
            {isAuthenticated && (
              <Link to="/upload" className={styles.navLink}>Subir asset</Link>
            )}
          </nav>
        </div>

        <div className={styles.headerCenter}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="search"
              placeholder="Buscar assets..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar assets"
            />
            <button type="submit" className={styles.searchButton} aria-label="Buscar">
              {/* Icono SVG o FontAwesome sería mejor */}
              🔍
            </button>
          </form>
        </div>

        <div className={styles.headerRight}>
          {/* Icono de menú para móviles */}
           <button className={styles.mobileMenuIcon} onClick={toggleMobileMenu} aria-label="Abrir menú" aria-expanded={isMobileMenuOpen}>
             ☰
           </button>

          {/* Menú de usuario o botones de Login/Registro */}
          {isAuthenticated && user ? (
            <div className={styles.userInfoContainer} ref={userMenuRef}>
               <button onClick={toggleUserMenu} className={styles.userButton} aria-label="Menú de usuario" aria-expanded={isUserMenuOpen}>
                 {/* Podrías poner un avatar aquí */}
                 <span className={styles.userName}>{user.nombre || user.email}</span>
                 <span className={styles.caret}>▼</span> {/* Indicador de desplegable */}
               </button>
               {isUserMenuOpen && (
                 <UserMenu
                    onLogout={() => { logout(); setIsUserMenuOpen(false); }}
                    onDashboard={() => { navigate('/dashboard'); setIsUserMenuOpen(false); }}
                    onProfile={() => { navigate('/profile'); setIsUserMenuOpen(false); }} // Añadir ruta de perfil
                 />
               )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={`${styles.navLink} ${styles.authLink}`}>Login</Link>
              <Link to="/register" className={`${styles.navLink} ${styles.authLink} ${styles.registerButton}`}>Registro</Link>
            </div>
          )}
        </div>
      </div>

      {/* Menú desplegable para móviles */}
      {isMobileMenuOpen && (
        <nav className={styles.mobileNav}>
          {/* <Link to="/" className={styles.mobileNavLink} onClick={closeMobileMenu}>Inicio</Link> */}
          <Link to="/browse" className={styles.mobileNavLink} onClick={closeMobileMenu}>Explorar assets</Link>
          {isAuthenticated && (
            <Link to="/upload" className={styles.mobileNavLink} onClick={closeMobileMenu}>Subir asset</Link>
          )}
           <hr className={styles.mobileNavDivider}/>
           {!isAuthenticated && (
             <>
               <Link to="/login" className={styles.mobileNavLink} onClick={closeMobileMenu}>Login</Link>
               <Link to="/register" className={styles.mobileNavLink} onClick={closeMobileMenu}>Registro</Link>
             </>
           )}
        </nav>
      )}
    </header>
  );
}

export default Header;