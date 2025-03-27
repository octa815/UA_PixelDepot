const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const {errorHandler} = require("./middleware/errorMiddleware");
const app = express();
const colors = require("colors");
const connectDB = require("./config/db");

connectDB();
// Configuración
app.use(express.json());
app.use(cors());
console.log("Mongo URI:", process.env.MONGO_URI);
// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("Error de conexión a MongoDB:", err));

// Rutas de usuario
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);
app.use("/api/auth", userRoutes);

app.use(errorHandler)

// Configuración de HTTPS
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/private-key.pem')), // Cambiado para usar una ruta absoluta
  cert: fs.readFileSync(path.join(__dirname, 'ssl/certificate.pem')), // Cambiado también aquí
};

// Iniciar servidor HTTPS
const PORT = process.env.PORT || 5000;
https.createServer(options, app).listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en https://localhost:${PORT}`);
});
