const multer = require("multer");
const path = require("path");

// Configuração do armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

// 🔹 Permitir imagens de qualquer formato (.webp, .png, .jpg, .jpeg, .gif, etc.)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Formato de arquivo não suportado! Apenas imagens são permitidas."
      ),
      false
    );
  }
};

// Criando o middleware de upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo por imagem
});

module.exports = upload;
