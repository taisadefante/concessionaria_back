require("dotenv").config(); // 🔹 Carrega as variáveis de ambiente do .env

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const vehiclesRoutes = require("./routes/vehicles");

const app = express();
const port = process.env.PORT || 3001; // Agora usa a variável de ambiente

// Middleware
app.use(express.json());
app.use(cors());

// 📂 Criar a pasta uploads caso não exista
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📂 Pasta 'uploads' criada com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao criar a pasta 'uploads':", err);
  }
}

// Servindo imagens da pasta uploads corretamente
app.use("/uploads", express.static(uploadDir));

// Usar as rotas da API
app.use("/api", vehiclesRoutes);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
