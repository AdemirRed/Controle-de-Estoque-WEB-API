import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import cors from 'cors';
import fs from 'fs';
import https from 'https';
import { WebSocketServer } from 'ws'; // Importa WebSocketServer
import app from './app.js'; // Importa a aplicação


const allowedOrigins = [
  'https://redblackspy.ddns.net:2002',
  'https://redblackspy.ddns.net:3001',
  'https://inventoryctr.netlify.app',
  'http://localhost:2002'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const wsPort = process.env.PORT_SERVER || 2010; // Porta WebSocket
const httpsPort = process.env.PORT_HTTPS || 2001; // Porta HTTPS

let wss;
try {
  // Tenta iniciar o servidor WebSocket na porta definida
  wss = new WebSocketServer({ port: wsPort });
  //console.log(`WebSocket server running on port ${wsPort}`);
} catch (error) {
  // Se a porta já estiver em uso, loga o erro e encerra a aplicação
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${wsPort} is already in use. Please free the port or use a different one.`);
    process.exit(1);
  } else {
    throw error;
  }
}

// Conexão WebSocket
wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const token = params.get('token'); // Obtém o token passado na URL

  // Validação simples do token - considere usar algo mais robusto como JWT
  if (token !== '94mBxZoPdDgY') { // Substitua pelo token esperado ou lógica de validação mais segura
    ws.close(1008, 'Invalid token'); // Fecha a conexão com código de política de violação
    //console.log('WebSocket connection rejected: Invalid token');
    return;
  }

  //console.log('WebSocket connection established');

  // Ouve por mensagens recebidas no WebSocket
  ws.on('message', () => {
    //console.log('Received:', message);
    ws.send('Message received');
  });


  // Fecha a conexão WebSocket quando o cliente desconectar
  ws.on('close', () => {
    //console.log('WebSocket connection  closed');
  });
});

// Inicia o servidor HTTPS
const options = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
};

https.createServer(options, app).listen(httpsPort, () => {
  console.log(`Servidor HTTPS rodando na porta ${httpsPort}`);
});
