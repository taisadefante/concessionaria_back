const express = require("express");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");

const router = express.Router();
const vehiclesFile = path.join(__dirname, "../vehicles.json");

// 🔹 Função para ler os veículos do arquivo JSON
const readVehicles = () => {
  try {
    if (!fs.existsSync(vehiclesFile)) return [];
    const data = fs.readFileSync(vehiclesFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Erro ao ler o arquivo JSON:", err);
    return [];
  }
};

// 🔹 Função para salvar os veículos no arquivo JSON
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

    // 🔹 Garante que `images` seja sempre um array
    const vehiclesWithImages = vehicles.map((vehicle) => ({
      ...vehicle,
      images: Array.isArray(vehicle.images)
        ? vehicle.images
        : vehicle.images
        ? [vehicle.images]
        : [],
    }));

    res.json(vehiclesWithImages);
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

    const vehicles = readVehicles();

    const newVehicle = {
      id: Date.now(),
      carName,
      description,
      price: parseFloat(price),
      year: parseInt(year),
      brand,
      model,
      mileage: parseInt(mileage),
      color,
      options,
      images:
        req.files.length > 0
          ? req.files.map((file) => `/uploads/${file.filename}`)
          : [],
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

    if (index !== -1) {
      // Mantém as imagens antigas se nenhuma nova for enviada
      const updatedImages =
        req.files.length > 0
          ? req.files.map((file) => `/uploads/${file.filename}`)
          : vehicles[index].images;

      vehicles[index] = {
        ...vehicles[index],
        ...req.body,
        price: parseFloat(req.body.price) || vehicles[index].price,
        year: parseInt(req.body.year) || vehicles[index].year,
        mileage: parseInt(req.body.mileage) || vehicles[index].mileage,
        images: updatedImages,
      };

      writeVehicles(vehicles);
      res.json(vehicles[index]);
    } else {
      res.status(404).json({ error: "Veículo não encontrado." });
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar veículo:", error);
    res.status(500).json({ error: "Erro ao atualizar veículo." });
  }
});

// 🔹 Excluir um veículo
router.delete("/vehicles/:id", (req, res) => {
  try {
    const vehicles = readVehicles();
    const id = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return res.status(404).json({ error: "Veículo não encontrado." });
    }

    const newVehicles = vehicles.filter((v) => v.id !== id);
    writeVehicles(newVehicles);

    res.json({ success: true, message: "Veículo excluído com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao excluir veículo:", error);
    res.status(500).json({ error: "Erro ao excluir veículo." });
  }
});

module.exports = router;
