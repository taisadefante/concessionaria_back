const path = require("path");

const config = {
  port: process.env.PORT || 3001, // Permite definir porta via variável de ambiente
  uploadDir: path.join(__dirname, "../uploads"), // Caminho absoluto para a pasta de uploads
};

module.exports = config;
