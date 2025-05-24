/* eslint-disable no-unused-vars */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth.js';

export default async (req, res, next) => {
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
    
    console.log('Token decodificado:', decoded); // Debug

    // Tenta obter o ID do usuário de várias formas possíveis
    req.userId = decoded.id || decoded.usuario_id || decoded.userId;
    req.userRole = decoded.papel || decoded.role;
    req.userName = decoded.nome || decoded.name;
    
    console.log('ID do usuário extraído:', req.userId); // Debug

    if (!req.userId) {
      console.log('Conteúdo completo do token:', decoded); // Debug
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Token inválido - ID do usuário não encontrado',
        debug: decoded // Remover em produção
      });
    }

    return next();
  } catch (err) {
    console.error('Erro na verificação do token:', err); // Debug
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_INVALID',
      message: 'Token inválido',
      error: err.message // Remover em produção
    });
  }
};
