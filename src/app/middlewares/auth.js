/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth.js';
import User from '../models/users.js';

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
      // Busca o usuário no banco para garantir papel atualizado
      const usuario = await User.findByPk(decoded.id || decoded.usuario_id || decoded.userId);
      if (!usuario) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_TOKEN',
          message: 'Usuário não encontrado no banco',
          debug: decoded // Remover em produção
        });
      }
      req.userId = usuario.id;
      req.userRole = usuario.papel;
      req.userName = usuario.nome;
      req.user = usuario;
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
