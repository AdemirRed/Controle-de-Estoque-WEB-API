/* eslint-disable no-unused-vars */
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/users.js';

// Configure as chaves VAPID (coloque as suas em variáveis de ambiente)
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class PushNotificationController {
  async subscribe(req, res) {
    try {
      const { subscription } = req.body;
      const userId = req.userId;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Subscription inválida.' });
      }

      // Salva ou atualiza a subscription do usuário
      await PushSubscription.upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      }, {
        where: { user_id: userId, endpoint: subscription.endpoint }
      });

      return res.status(201).json({ message: 'Subscription salva com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar subscription.' });
    }
  }

  async notifyAdmins(req, res) {
    try {
      const { title, body, url } = req.body;

      // Busca todos os admins
      const admins = await User.findAll({ where: { papel: 'admin' } });
      if (!admins || admins.length === 0) {
        console.error('Nenhum admin encontrado.');
        return res.status(404).json({ error: 'Nenhum admin encontrado.' });
      }
      const adminIds = admins.map(a => a.id);

      // Busca subscriptions dos admins
      const subscriptions = await PushSubscription.findAll({
        where: { user_id: adminIds }
      });
      if (!subscriptions || subscriptions.length === 0) {
        console.error('Nenhuma subscription encontrada para admins.');
        return res.status(404).json({ error: 'Nenhuma subscription encontrada para admins.' });
      }

      const payload = JSON.stringify({ title, body, url });

      // Envia notificação para cada subscription
      const results = await Promise.all(subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload);
          return { success: true };
        } catch (err) {
          console.error('Erro ao enviar para', sub.endpoint, err.message);
          return { success: false, error: err.message };
        }
      }));

      return res.json({ sent: results.length, results });
    } catch (error) {
      console.error('Erro geral no notifyAdmins:', error);
      return res.status(500).json({ error: 'Erro ao enviar notificações.' });
    }
  }
}

export default new PushNotificationController();
