import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Registro.css";
import logo from "./css/logo.png";


function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false); // Estado para el menú
  const [usuario, setUsuario] = useState(null); // Estado para el usuario
  const [userMenuAbierto, setUserMenuAbierto] = useState(false); // Estado para el menú de usuario
  const navigate = useNavigate(); // Hook para la navegación
  const userMenuRef = useRef(null); // Referencia para el menú de usuario

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }

    // Función para cerrar el menú de usuario al hacer clic fuera de él
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRegistroClick = () => {
    navigate("/registro");
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <header className="header-container">
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo" />
          <div className="menu-icon" onClick={() => setMenuAbierto(!menuAbierto)}>
            ☰
          </div>
          <nav className={`menu-dropdown ${menuAbierto ? "show" : ""}`}>
            <a href="/" className="header-link">Inicio</a>
            <a href="/explorar" className="header-link">Explorar</a>
            {usuario && <a href="/subir-assets" className="header-link">Subir Assets</a>}
          </nav>
          <nav className="header-nav">
            <a href="/" className="header-link">Inicio</a>
            <a href="/explorar" className="header-link">Explorar</a>
            {usuario && <a href="/subir-assets" className="header-link">Subir Assets</a>}
          </nav>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Buscar" className="search-input" />
          <button className="search-button">🔍</button>
        </div>
        {usuario && (
          <div className="user-info" onClick={() => setUserMenuAbierto(!userMenuAbierto)} ref={userMenuRef}>
            <span className="user-name">{usuario.nombre}</span>
            {userMenuAbierto && (
              <div className="user-menu">
                <button onClick={handleDashboardClick}>Dashboard</button>
                <button onClick={handleLogout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        )}
      </header>
      <div className="registro-container">
        <div className="registro-box">
          <h2 className="registro-title">Bienvenido a la plataforma</h2>
          <p className="registro-footer">Explora nuestras funcionalidades y disfruta de la experiencia.</p>
          {!usuario && <button className="registro-button" onClick={handleRegistroClick}>Ir a registro</button>}
        </div>
      </div>
    </div>
  );
}

export default Home;
