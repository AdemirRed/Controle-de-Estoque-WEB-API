/* eslint-disable no-unused-vars */

export default async (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ erro: 'Acesso permitido apenas para administradores.' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao verificar permissões de administrador.' });
  }
};
