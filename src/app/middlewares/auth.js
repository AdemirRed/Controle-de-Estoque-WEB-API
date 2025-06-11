/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth.js';

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_NOT_PROVIDED',
        message: 'Token não fornecido'
      });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);

      // Compatibilidade com diferentes formatos de payload
      req.userId = decoded.id || decoded.usuario_id || decoded.userId;
      req.userRole = decoded.papel || decoded.role;
      req.userName = decoded.nome || decoded.name;
      req.user = decoded;

      if (!req.userId) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_TOKEN',
          message: 'Token inválido - ID do usuário não encontrado',
          debug: decoded // Remover em produção
        });
      }

      return next();
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_INVALID',
        message: 'Token inválido',
        error: err.message // Remover em produção
      });
    }
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno na autenticação.' });
  }
};
