/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Simplifica a extração dos dados do token
    req.userId = decoded.id;
    req.userRole = decoded.papel;
    req.userName = decoded.nome;

    if (!req.userId) {
      return res.status(401).json({ erro: 'Token inválido - ID não encontrado.' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }
};
