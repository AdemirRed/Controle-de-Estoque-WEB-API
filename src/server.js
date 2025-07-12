import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import http from 'http';
import https from 'https';
import { WebSocketServer } from 'ws';
import app from './app.js';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 2001;
const WS_PORT = process.env.PORT_SERVER || 2010;
const isProduction = process.env.NODE_ENV === 'production';

// Redirecionamento para HTTPS (apenas em desenvolvimento local)
app.enable('trust proxy');

// Servidor
if (isProduction) {
  // Em produção (Render), use HTTP simples - o Render adiciona HTTPS automaticamente
  http.createServer(app).listen(PORT, HOST, () => {
    console.log(`✅ Servidor HTTP rodando em https://${HOST}:${PORT}`);
  });
} else {
  // Em desenvolvimento local, use HTTPS com certificados
  const sslOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
  };

  https.createServer(sslOptions, app).listen(PORT, HOST, () => {
    console.log(`✅ Servidor HTTPS rodando em https://${HOST}:${PORT}`);
  });
}

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
