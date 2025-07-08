import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import fs from 'fs';
import https from 'https';
import { WebSocketServer } from 'ws';
import app from './app.js';

const HOST = process.env.HOST || '0.0.0.0';
const HTTPS_PORT = process.env.PORT_HTTPS || 2001;
const WS_PORT = process.env.PORT_SERVER || 2010;

// Lista de domínios permitidos
const allowedOrigins = [
  'https://redblackspy.ddns.net:2002',
  'https://redblackspy.ddns.net:3001',
  'https://inventoryctr.netlify.app',
  'http://localhost:2002'
];

// CORS configurado
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Redirecionamento para HTTPS (caso esteja atrás de proxy)
app.enable('trust proxy');
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }
  res.redirect(`https://${req.headers.host}${req.url}`);
});

// Certificados SSL (use certificados válidos em produção)
const sslOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
};

// Servidor HTTPS
https.createServer(sslOptions, app).listen(HTTPS_PORT, HOST, () => {
  console.log(`✅ Servidor HTTPS rodando em https://${HOST}:${HTTPS_PORT}`);
});

// WebSocket Server
let wss;
try {
  wss = new WebSocketServer({ port: WS_PORT });
  console.log(`✅ WebSocket ativo em ws://${HOST}:${WS_PORT}`);
} catch (err) {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${WS_PORT} em uso. Altere ou libere-a.`);
    process.exit(1);
  } else {
    throw err;
  }
}

// Conexão WebSocket segura com token simples
wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const token = params.get('token');

  if (token !== '94mBxZoPdDgY') {
    ws.close(1008, 'Token inválido');
    return;
  }

  ws.on('message', () => {
    ws.send('Mensagem recebida');
  });

  ws.on('close', () => {
    // Conexão fechada
  });
});
