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

// 🔹 Listar todos os veículos
router.get("/vehicles", (req, res) => {
  try {
    const vehicles = readVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error("❌ Erro ao buscar veículos:", error);
    res.status(500).json({ error: "Erro ao buscar veículos." });
  }
});

// 🔹 Cadastrar um novo veículo (Aceita múltiplas imagens)
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

    if (!carName || !price || !year || !brand || !model) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    const vehicles = readVehicles();

    const newVehicle = {
      id: Date.now(),
      carName,
      description,
      price: parseFloat(price) || 0,
      year: parseInt(year) || 0,
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
    console.error("❌ Erro ao cadastrar veículo:", error);
    res.status(500).json({ error: "Erro ao cadastrar veículo." });
  }
});

// 🔹 Atualizar um veículo
router.put("/vehicles/:id", upload.array("images", 5), (req, res) => {
  try {
    const vehicles = readVehicles();
    const id = parseInt(req.params.id);
    const index = vehicles.findIndex((v) => v.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Veículo não encontrado." });
    }

    // 🔹 Deletar imagens antigas se novas forem enviadas
    if (req.files.length > 0) {
      vehicles[index].images.forEach((image) => {
        const imagePath = path.join(__dirname, "..", image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    vehicles[index] = {
      ...vehicles[index],
      ...req.body,
      price: parseFloat(req.body.price) || vehicles[index].price,
      year: parseInt(req.body.year) || vehicles[index].year,
      mileage: parseInt(req.body.mileage) || vehicles[index].mileage,
      images:
        req.files.length > 0
          ? req.files.map((file) => `/uploads/${file.filename}`)
          : vehicles[index].images,
    };

    writeVehicles(vehicles);
    res.json(vehicles[index]);
  } catch (error) {
    console.error("❌ Erro ao atualizar veículo:", error);
    res.status(500).json({ error: "Erro ao atualizar veículo." });
  }
});

// 🔹 Excluir um veículo e suas imagens associadas
router.delete("/vehicles/:id", (req, res) => {
  try {
    const vehicles = readVehicles();
    const id = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return res.status(404).json({ error: "Veículo não encontrado." });
    }

    // 🔹 Deletar imagens do veículo da pasta "uploads"
    vehicles[vehicleIndex].images.forEach((image) => {
      const imagePath = path.join(__dirname, "..", image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    // 🔹 Remover o veículo do JSON
    const newVehicles = vehicles.filter((v) => v.id !== id);
    writeVehicles(newVehicles);

    res.json({
      success: true,
      message: "Veículo e imagens excluídos com sucesso.",
    });
  } catch (error) {
    console.error("❌ Erro ao excluir veículo:", error);
    res.status(500).json({ error: "Erro ao excluir veículo." });
  }
});

module.exports = router;
