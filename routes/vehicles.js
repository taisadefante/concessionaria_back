const express = require("express");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");

const router = express.Router();
const vehiclesFile = path.join(__dirname, "../vehicles.json");

// Criar arquivo JSON se não existir
if (!fs.existsSync(vehiclesFile)) {
  fs.writeFileSync(vehiclesFile, JSON.stringify([], null, 2), "utf8");
}

// Função para ler os veículos do JSON
const readVehicles = () => {
  try {
    const data = fs.readFileSync(vehiclesFile, "utf8");
    return JSON.parse(data) || [];
  } catch (err) {
    return [];
  }
};

// Função para salvar os veículos no JSON
const writeVehicles = (vehicles) => {
  fs.writeFileSync(vehiclesFile, JSON.stringify(vehicles, null, 2), "utf8");
};

// Listar veículos
router.get("/vehicles", (req, res) => {
  res.json(readVehicles());
});

// Cadastrar veículo
router.post("/vehicles", upload.array("images", 5), (req, res) => {
  try {
    const {
      carName,
      description,
      price,
      year,
      brand,
      model,
      mileage,
      color,
      options,
    } = req.body;
    const vehicles = readVehicles();

    const newVehicle = {
      id: Date.now(),
      carName,
      description,
      price: parseFloat(price),
      year: parseInt(year),
      brand,
      model,
      mileage: parseInt(mileage) || 0,
      color,
      options: options || "Nenhum",
      images: req.files.map((file) => `/uploads/${file.filename}`),
    };

    vehicles.push(newVehicle);
    writeVehicles(vehicles);
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar veículo." });
  }
});

// Excluir veículo e imagens
router.delete("/vehicles/:id", (req, res) => {
  const vehicles = readVehicles();
  const id = parseInt(req.params.id);
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return res.status(404).json({ error: "Veículo não encontrado." });
  }

  // Excluir imagens do diretório
  vehicle.images.forEach((image) => {
    const imagePath = path.join(__dirname, "..", image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  });

  const newVehicles = vehicles.filter((v) => v.id !== id);
  writeVehicles(newVehicles);
  res.json({ success: true, message: "Veículo excluído com sucesso." });
});

module.exports = router;
