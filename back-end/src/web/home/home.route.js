const express = require('express');
const router = express.Router();

// Importar os controladores
const quantidades = require('./controllers/quantidades').quantidades;
const exibirAvisos = require('./controllers/exibirAvisos').exibirAvisos

// Definir as rotas
router.post('/qnt', quantidades);
router.post('/exibir-avisos', exibirAvisos);
 
module.exports = router;
