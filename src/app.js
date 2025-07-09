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
    // Configuração do CORS - permitir apenas universoredblack.com.br
    this.app.use(cors({
      origin: ['https://universoredblack.com.br', 'http://universoredblack.com.br', 'https://wwwuniversoredblack.com.br'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Middleware adicional para garantir CORS
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin && (origin === 'https://universoredblack.com.br' || origin === 'http://universoredblack.com.br')) {
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
