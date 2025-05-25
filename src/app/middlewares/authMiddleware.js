/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth.js';

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);
      req.userId = decoded.id;
      req.userRole = decoded.papel;
      
      return next();
    } catch (err) {
      return res.status(401).json({ erro: 'Token inválido.' });
    }
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno na autenticação.' });
  }
};
