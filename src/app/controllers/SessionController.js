import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import authConfig from '../../config/auth.js';
import User from '../models/users.js';

class SessionController {
  async store(req, res) {
    console.log('🔍 SessionController.store chamado:', req.body);
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email('Email inválido')
          .required('Email é obrigatório'),
        senha_hash: Yup.string()
          .required('Senha é obrigatória')
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ erro: 'Falha na validação' });
      }

      const { email, senha_hash } = req.body;

      const user = await User.findOne({ 
        where: { email },
        raw: false 
      });

      if (!user) {
        return res.status(401).json({ erro: 'Usuário não encontrado' });
      }

      const senhaValida = await bcrypt.compare(senha_hash, user.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
      }

      const { id, nome, papel } = user;

      // Simplificar a estrutura do token
      const token = jwt.sign(
        { 
          id,  // Usar apenas id como identificador principal
          nome,
          papel
        },
        authConfig.secret,
        { expiresIn: authConfig.expiresIn }
      );

      // Retorno com as informações do usuário e o token
      return res.json({
        usuario: { id, nome, email, papel },
        token,
      });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return res.status(500).json({ 
        erro: 'Erro interno do servidor',
        detalhes: error.message 
      });
    }
  }
}

export default new SessionController();
