const express = require("express");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");

const router = express.Router();
const vehiclesFile = path.join(__dirname, "../vehicles.json");
const uploadDir = path.join(__dirname, "../uploads");

// 🔹 Criar o arquivo JSON caso não exista
if (!fs.existsSync(vehiclesFile)) {
  fs.writeFileSync(vehiclesFile, JSON.stringify([], null, 2), "utf8");
}

// 🔹 Função para ler os veículos do JSON
const readVehicles = () => {
  try {
    const data = fs.readFileSync(vehiclesFile, "utf8");
    return JSON.parse(data) || [];
  } catch (err) {
    console.error("❌ Erro ao ler o arquivo JSON:", err);
    return [];
  }
};

// 🔹 Função para salvar os veículos no JSON
const writeVehicles = (vehicles) => {
  try {
    fs.writeFileSync(vehiclesFile, JSON.stringify(vehicles, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Erro ao escrever no arquivo JSON:", err);
  }
};

// 🔹 Função para excluir imagens associadas ao veículo
const deleteVehicleImages = (images) => {
  if (Array.isArray(images)) {
    images.forEach((imagePath) => {
      const absolutePath = path.join(__dirname, "..", imagePath); // Caminho correto
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath); // Remove a imagem
          console.log(`🗑️ Imagem removida: ${absolutePath}`);
        } catch (err) {
          console.error(`❌ Erro ao excluir a imagem ${absolutePath}:`, err);
        }
      }
    });
  }
};

// 🔹 Excluir um veículo e suas imagens associadas
router.delete("/vehicles/:id", (req, res) => {
  try {
    const vehicles = readVehicles();
    const id = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return res.status(404).json({ error: "Veículo não encontrado." });
    }

    const vehicleToDelete = vehicles[vehicleIndex];

    // 🔹 Exclui as imagens associadas
    deleteVehicleImages(vehicleToDelete.images);

    const newVehicles = vehicles.filter((v) => v.id !== id);
    writeVehicles(newVehicles);

    res.json({
      success: true,
      message: "✅ Veículo e imagens excluídos com sucesso!",
    });
  } catch (error) {
    console.error("❌ Erro ao excluir veículo:", error);
    res.status(500).json({ error: "Erro ao excluir veículo." });
  }
});

module.exports = router;
