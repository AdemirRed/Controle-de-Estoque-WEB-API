import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import './database/index.js';
import routes from './routes.js';

import './database/index.js'; // Importa a configuração do banco de dados

class App {
  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
  }

  middleware() {
    // Configuração do CORS - garantir que seja aplicada antes de qualquer outra middleware
    this.app.use(cors({
      origin: [
        'https://redblackspy.ddns.net:2002',
        'https://redblackspy.ddns.net:3001', 
        'https://inventoryctr.netlify.app',
        'http://localhost:2002'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Middleware que adiciona cabeçalhos CORS diretamente
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin === 'https://inventoryctr.netlify.app') {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      // Responder imediatamente para requisições OPTIONS
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      
      next();
    });

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  routes() {
    this.app.use(routes);
  }
}

export default new App().app;
