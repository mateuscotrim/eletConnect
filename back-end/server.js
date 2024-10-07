require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

// Função para obter o endereço IP local
function obterEnderecoIPLocal() {
  const interfaces = os.networkInterfaces();
  for (const nomeInterface of Object.keys(interfaces)) {
    for (const iface of interfaces[nomeInterface]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const IPLocal = obterEnderecoIPLocal();
// console.log('Endereço IP local:', IPLocal); // Comentado para não aparecer no log

// Configuração do CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    `http://${IPLocal}:5173`,
  ],
  credentials: true,
}));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev')); // Se deseja remover logs de requisição, comente ou remova esta linha

// Segurança básica com cabeçalhos HTTP
app.use(helmet());

// Limitação de requisições por IP para prevenir abusos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000,
});
app.use(limiter);

// Configuração da sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-padrao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // `false` para desenvolvimento em HTTP
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
}));

// Log da sessão para depuração
app.use((req, res, next) => {
  // console.log('Sessão:', req.session); // Comentado para não aparecer no log
  next();
});

// Servir arquivos estáticos da build do React
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Endpoint de status
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor está funcionando corretamente',
  });
});

// Importação das rotas
app.use(require('./src/routes'));

// Rota para servir o index.html para qualquer outra rota (para compatibilidade com o React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
});

// Inicialização do servidor
app.listen(PORT, HOST, () => {
  console.warn(`Servidor rodando em http://${IPLocal}:${PORT} (ou http://localhost:${PORT})`); // Comentado para não aparecer no log
});
