import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Bienvenido a la plataforma</h1>
      <button className="home-button" onClick={() => navigate("/registro")}>
        Ir a Registro
      </button>
    </div>
  );
}

export default Home;
  