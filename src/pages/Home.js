import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Registro.css";
import logo from "./css/logo.png";

function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false); // Estado para el menú
  const navigate = useNavigate(); // Hook para la navegación

  const handleRegistroClick = () => {
    navigate("/registro");
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
          </nav>
          <nav className="header-nav">
            <a href="/" className="header-link">Inicio</a>
            <a href="/explorar" className="header-link">Explorar</a>
          </nav>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Buscar" className="search-input" />
          <button className="search-button">🔍</button>
        </div>
      </header>
      <div className="registro-container">
        <div className="registro-box">
          <h2 className="registro-title">Bienvenido a la plataforma</h2>
          <p className="registro-footer">Explora nuestras funcionalidades y disfruta de la experiencia.</p>
          <button className="registro-button" onClick={handleRegistroClick}>Ir a Registro</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
