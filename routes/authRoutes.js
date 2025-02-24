const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET_KEY = "seu_segredo_super_secreto";

// Usuário e senha fixos
const USERS = {
  adminveiculos: "admin",
};

// Rota de login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (USERS[username] && USERS[username] === password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Usuário ou senha inválidos" });
});

module.exports = router;
