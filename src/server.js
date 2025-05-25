require('dotenv').config(); // Carrega variáveis do .env
import cors from 'cors';
import { WebSocketServer } from 'ws'; // Importa WebSocketServer
import app from './app.js'; // Importa a aplicação

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0'; // Fallback para qualquer interface

const allowedOrigins = [
  'http://192.168.0.200:2002',
  'http://192.168.0.200:3001',
  'http://localhost:2002'
];

// Configuração do CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true, // Necessário se você estiver enviando cookies ou autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));

const wsPort = process.env.PORT_SERVER || 3002; // Usa a porta do .env ou fallback para 3002

let wss;
try {
  // Tenta iniciar o servidor WebSocket na porta definida
  wss = new WebSocketServer({ port: wsPort });
  console.log(`WebSocket server running on port ${wsPort}`);
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
    console.log('WebSocket connection rejected: Invalid token');
    return;
  }

  console.log('WebSocket connection established');

  // Ouve por mensagens recebidas no WebSocket
  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send('Message received');
  });


  // Fecha a conexão WebSocket quando o cliente desconectar
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Inicia o servidor Express
app.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? '192.168.0.200' : host ;
  console.log(`Server running at http://${displayHost}:${port}`);
});
