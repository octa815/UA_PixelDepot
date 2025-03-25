import axios from "axios";
import { useState } from "react";
import "./css/Registro.css";
import logo from "./css/logo.png";

function Registro() {
  const [usuario, setUsuario] = useState({ nombre: "", email: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false); // Estado para el menú

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post("/api/registro", usuario);
      setMensaje(respuesta.data.mensaje);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "Error al registrar usuario");
    }
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
          <a href="#" className="header-link">Inicio</a>
          <a href="#" className="header-link">Explorar</a>
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
        {mensaje && <p>{mensaje}</p>}
        <h2 className="registro-title">Registro</h2>
        <form className="registro-form" onSubmit={handleSubmit}>
          <div>
            <label className="registro-label">Nombre de Usuario</label>
            <input type="text" name="nombre" className="registro-input" onChange={handleChange} />
          </div>
          <div>
            <label className="registro-label">Email</label>
            <input type="email" name="email" className="registro-input" onChange={handleChange} />
          </div>
          <div>
            <label className="registro-label">Contraseña</label>
            <input type="password" name="password" className="registro-input" onChange={handleChange} />
          </div>
          <div>
            <label className="registro-label">Repetir Contraseña</label>
            <input type="password" className="registro-input" />
          </div>
          <button type="submit" className="registro-button">Registrarse</button>
        </form>
        <p className="registro-footer">¿Ya estás registrado? <a href="#" className="registro-link">Inicia sesión aquí</a></p>
      </div>
    </div>
  </div>
  );
}

export default Registro;
