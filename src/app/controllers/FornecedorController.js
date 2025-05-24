/* eslint-disable no-unused-vars */
import Fornecedor from '../models/Fornecedor.js';

class FornecedorController {
  async index(req, res) {
    try {
      const fornecedores = await Fornecedor.findAll();
      return res.json(fornecedores);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const fornecedor = await Fornecedor.findByPk(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      return res.json(fornecedor);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async store(req, res) {
    try {
      const { nome, telefone, email } = req.body;

      if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }

      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Formato de e-mail inválido' });
      }

      // Se email estiver vazio, remove do req.body para não causar erro de validação
      if (!email) {
        delete req.body.email;
      }

      const fornecedor = await Fornecedor.create(req.body);
      return res.status(201).json(fornecedor);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          messages: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const fornecedor = await Fornecedor.findByPk(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      const { email } = req.body;
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Formato de e-mail inválido' });
      }

      // Se email estiver vazio, remove do req.body para não causar erro de validação
      if (!email) {
        delete req.body.email;
      }

      await fornecedor.update(req.body);
      return res.json(fornecedor);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          messages: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const fornecedor = await Fornecedor.findByPk(req.params.id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      
      await fornecedor.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new FornecedorController();
