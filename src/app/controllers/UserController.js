import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import User from '../models/users.js';

// Schema de validação definido diretamente no controller
const userSchema = Yup.object().shape({
  nome: Yup.string().required('O nome é obrigatório'),
  email: Yup.string()
    .email('E-mail inválido')
    .required('O e-mail é obrigatório'),
  senha_hash: Yup.string()
    .required('A senha é obrigatória')
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
  papel: Yup.string()
    .oneOf(['admin', 'usuario'], 'O papel deve ser admin ou usuario')
    .default('usuario'),
});

class UserController {
  async store(req, res) {
    try {
      // Validação dos dados de entrada usando schema
      await userSchema.validate(req.body, { abortEarly: false });

      const { nome, email, senha_hash, papel } = req.body;

      const usuarioExiste = await User.findOne({ where: { email } });
      if (usuarioExiste) {
        return res
          .status(409)
          .json({ erro: 'Já existe um usuário cadastrado com este e-mail.' });
      }

      const senhaCriptografada = await bcrypt.hash(senha_hash, 8);

      const usuario = await User.create({
        id: uuidv4(),
        nome,
        email,
        senha_hash: senhaCriptografada,
        papel: papel === 'admin' ? 'admin' : 'usuario',
      });

      return res
        .status(201)
        .json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Erro de validação',
          details: error.errors
        });
      }

      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async index(req, res) {
    try {
      const usuarios = await User.findAll({
        attributes: ['id', 'nome', 'email', 'createdAt', 'updatedAt'],
      });
      // Retorna array vazio se não houver usuários
      return res.json(usuarios || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: ['id', 'nome', 'email', 'papel'],
      });

      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha_hash, papel } = req.body;

      const usuario = await User.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      if (email && email !== usuario.email) {
        const emailExiste = await User.findOne({ where: { email } });
        if (emailExiste) {
          return res
            .status(409)
            .json({ erro: 'Já existe um usuário cadastrado com este e-mail.' });
        }
      }

      let senhaCriptografada = usuario.senha_hash;
      if (senha_hash) {
        senhaCriptografada = await bcrypt.hash(senha_hash, 8);
      }

      await usuario.update({
        nome: nome || usuario.nome,
        email: email || usuario.email,
        senha_hash: senhaCriptografada,
        papel: papel || usuario.papel,
      });

      return res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ erro: 'O e-mail é obrigatório.' });
      }

      const usuario = await User.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({ mensagem: 'E-mail não encontrado.' });
      }

      return res.status(200).json({ mensagem: 'E-mail encontrado.' });
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      return res.status(500).json({ erro: 'Erro ao verificar e-mail.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario = await User.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      await usuario.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }
}

export default new UserController();
