import React, { useEffect, useState } from "react";
import "./css/Registro.css";
import logo from "./css/logo.png";

function Dashboard() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  return (
    <div>
      <header className="header-container">
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo" />
          <nav className="header-nav">
            <a href="/" className="header-link">Inicio</a>
            <a href="/explorar" className="header-link">Explorar</a>
            <a href="/subir-assets" className="header-link">Subir Assets</a>
          </nav>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Buscar" className="search-input" />
          <button className="search-button">🔍</button>
        </div>
      </header>
      <div className="registro-container">
        <div className="registro-box">
          <h2 className="registro-title">Dashboard de {usuario ? usuario.nombre : "Usuario"}</h2>
          <p className="registro-footer">Aquí puedes ver y gestionar tus datos.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;