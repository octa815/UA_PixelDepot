require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const app = express();

// Configuración
app.use(express.json());
app.use(cors());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("Error de conexión a MongoDB:", err));

// Rutas de usuario
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);

// Configuración de HTTPS
const options = {
  key: fs.readFileSync("ssl/private-key.pem"), // Ruta a la clave privada
  cert: fs.readFileSync("ssl/certificate.pem"), // Ruta al certificado
};

// Iniciar servidor HTTPS
const PORT = process.env.PORT || 5000;
https.createServer(options, app).listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en https://localhost:${PORT}`);
});
