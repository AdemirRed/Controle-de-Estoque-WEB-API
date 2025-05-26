import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import './database/index.js';
import routes from './routes.js';

import './database'; // Importa a configuração do banco de dados

class App {
  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
  }

  middleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configuração simplificada do CORS
    this.app.use(cors());

    // Middleware adicional para garantir os headers CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
      next();
    });
  }

  routes() {
    this.app.use(routes);
  }
}

export default new App().app;
