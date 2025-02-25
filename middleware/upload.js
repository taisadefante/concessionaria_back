const multer = require("multer");
const path = require("path");

// Configuração do armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filtros para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de arquivo não suportado!"), false);
  }
};

// Criando o middleware de upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo por imagem
});

module.exports = upload;
