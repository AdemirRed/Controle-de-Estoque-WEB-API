/* eslint-disable no-unused-vars */
import Fornecedor from '../models/Fornecedor.js';

class FornecedorController {
  async index(req, res) {
    try {
      const fornecedores = await Fornecedor.findAll();
      if (!fornecedores || fornecedores.length === 0) {
        return res.json([]);
      }
      return res.json(fornecedores);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      // Tente buscar sem o array attributes para debug
      const fornecedor = await Fornecedor.findByPk(id);

      if (!fornecedor) {
        return res.json({});
      }

      return res.json(fornecedor);
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error); // Log detalhado
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  }

  async store(req, res) {
    try {
      const { nome, telefone, email } = req.body;

      if (!nome || !telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }

      const fornecedor = await Fornecedor.create({
        nome,
        telefone,
        email: email || null, // Define email como null se estiver vazio
      });

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
      
      console.error('Erro ao criar fornecedor:', error);
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
