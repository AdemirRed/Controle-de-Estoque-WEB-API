/* eslint-disable no-unused-vars */
import ItemRequest from '../models/ItemRequest.js';
import Item from '../models/Item.js';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/users.js';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class ItemRequestController {
  // Usuário faz uma requisição de item
  async store(req, res) {
    try {
      const { item_id, quantidade, observacao, requisitante_id } = req.body;
      // Corrigido: verifica se o papel do usuário é admin
      const isAdmin = req.userRole === 'admin';
      const finalRequisitanteId = isAdmin && requisitante_id ? requisitante_id : req.userId;

      if (!item_id || !quantidade) {
        return res.status(400).json({ error: 'item_id e quantidade são obrigatórios.' });
      }

      // Verifica se o item existe no estoque
      const item = await Item.findByPk(item_id);
      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado no estoque.' });
      }

      const itemRequest = await ItemRequest.create({
        requisitante_id: finalRequisitanteId,
        item_id,
        quantidade,
        observacao,
      });

      // Enviar notificação push para admins
      try {
        const admins = await User.findAll({ where: { papel: 'admin' } });
        const adminIds = admins.map(a => a.id);
        const subscriptions = await PushSubscription.findAll({ where: { user_id: adminIds } });
        const payload = JSON.stringify({
          title: 'Nova Requisição',
          body: 'Uma nova requisição de item foi criada.',
          url: '/item-requests'
        });
        subscriptions.forEach(sub => {
          webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload).catch(() => {});
        });
      } catch (e) {
        // Não impede o fluxo se falhar
      }

      return res.status(201).json(itemRequest);
    } catch (error) {
      console.error('Erro em store:', error); // Adicionado log
      return res.status(500).json({ error: 'Erro ao criar requisição de item.' });
    }
  }

  // Admin lista todas as requisições
  async index(req, res) {
    try {
      const requests = await ItemRequest.findAll();
      return res.json(requests);
    } catch (error) {
      console.error('Erro em index:', error); // Adicionado log
      return res.status(500).json({ error: 'Erro ao listar requisições.' });
    }
  }

  // Detalhar requisição específica
  async show(req, res) {
    try {
      const { id } = req.params;
      const itemRequest = await ItemRequest.findByPk(id);
      if (!itemRequest) {
        return res.status(404).json({ error: 'Requisição não encontrada.' });
      }
      return res.json(itemRequest);
    } catch (error) {
      console.error('Erro em show:', error); // Adicionado log
      return res.status(500).json({ error: 'Erro ao buscar requisição.' });
    }
  }

  // Admin altera status da requisição
  async update(req, res) {
    try {
      const { id } = req.params;
      const { status, observacao } = req.body;

      const itemRequest = await ItemRequest.findByPk(id);
      if (!itemRequest) {
        return res.status(404).json({ error: 'Requisição não encontrada.' });
      }

      if (status) itemRequest.status = status;
      if (observacao !== undefined) itemRequest.observacao = observacao;

      await itemRequest.save();

      return res.json(itemRequest);
    } catch (error) {
      console.error('Erro em update:', error); // Adicionado log
      return res.status(500).json({ error: 'Erro ao atualizar requisição.' });
    }
  }

  // Admin apaga requisição
  async delete(req, res) {
    try {
      const { id } = req.params;
      const itemRequest = await ItemRequest.findByPk(id);
      if (!itemRequest) {
        return res.status(404).json({ error: 'Requisição não encontrada.' });
      }
      await itemRequest.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Erro em delete:', error);
      return res.status(500).json({ error: 'Erro ao apagar requisição.' });
    }
  }

  // Usuário pode ver suas próprias requisições
  async userRequests(req, res) {
    try {
      const requisitante_id = req.userId;
      const requests = await ItemRequest.findAll({ where: { requisitante_id } });
      return res.json(requests);
    } catch (error) {
      console.error('Erro em userRequests:', error); // Adicionado log
      return res.status(500).json({ error: 'Erro ao listar suas requisições.' });
    }
  }
}

export default new ItemRequestController();
