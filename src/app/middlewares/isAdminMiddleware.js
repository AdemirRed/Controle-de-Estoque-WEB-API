/* eslint-disable no-unused-vars */

export default async (req, res, next) => {
  console.log('req.user:', req.user); // <-- Adicione este log

  try {
    // Aceita tanto req.user.papel quanto req.user.role quanto req.userRole para compatibilidade
    const papel = (req.user && (req.user.papel || req.user.role)) || req.userRole;
    if (!papel || papel !== 'admin') {
      return res.status(403).json({ erro: 'Acesso permitido apenas para administradores.' });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao verificar permissões de administrador.' });
  }
};
