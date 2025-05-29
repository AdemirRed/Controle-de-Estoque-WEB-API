/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';
import sendEmail from '../../utils/mailer.js';
import User from '../models/users.js';

const RECOVERY_LIMIT_TIME = 15 * 60 * 1000; // 15 minutos
const RECOVERY_ATTEMPT_LIMIT = 3;

class AuthController {
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Verifica se existe usuário cadastrado com o e-mail informado antes de qualquer processamento
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Retorna imediatamente sem tentar enviar e-mail ou processar nada
        return res.status(400).json({
          mensagem: 'E-mail não cadastrado ou incorreto.',
        });
      }

      const now = new Date();
      const lastAttempt = user.ultima_tentativa_recuperacao ? new Date(user.ultima_tentativa_recuperacao) : new Date(0);
      const attemptCount = user.tentativas_recuperacao || 0;

      // Verifica se o limite de tentativas foi excedido
      if (attemptCount >= RECOVERY_ATTEMPT_LIMIT && (now - lastAttempt) < RECOVERY_LIMIT_TIME) {
        return res.status(429).json({
          erro: 'Muitas tentativas de recuperação. Tente novamente mais tarde.',
        });
      }

      // Reseta o contador se o tempo limite passou
      const updateData = {};
      if ((now - lastAttempt) >= RECOVERY_LIMIT_TIME) {
        updateData.tentativas_recuperacao = 1;
      } else {
        updateData.tentativas_recuperacao = (attemptCount + 1);
      }

      updateData.ultima_tentativa_recuperacao = now;

      const codigo = crypto.randomInt(100000, 999999).toString();
      updateData.codigo_recuperacao = codigo;
      updateData.codigo_recuperacao_expiracao = new Date(now.getTime() + 5 * 60 * 1000);

      await user.update(updateData);

      try {
        await sendEmail({
          to: email,
          subject: 'Código de Recuperação de Senha – Controle de Estoque',
          text: `Olá,
        
        Recebemos uma solicitação para redefinir a senha da sua conta no sistema Controle de Estoque.
        
        Seu código de verificação é: ${codigo}
        
        Se você não solicitou essa alteração, ignore este e‑mail.
        
        Atenciosamente,
        Equipe Controle de Estoque`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; box-shadow: 0 4px 24px rgba(44,62,80,0.10);">
              <div style="background: #2d9cdb; border-radius: 12px 12px 0 0; padding: 32px 24px 16px 24px; text-align: center;">
                <img src="https://img.icons8.com/ios-filled/100/ffffff/lock-2.png" alt="Recuperação de Senha" style="width: 60px; margin-bottom: 12px;" />
                <h1 style="color: #fff; margin: 0; font-size: 2.2rem;">Recuperação de Senha</h1>
              </div>
              <div style="padding: 32px 24px;">
                <p style="font-size: 1.1rem; color: #333;">Olá,</p>
                <p style="font-size: 1rem; color: #444;">
                  Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Controle de Estoque</strong>.
                </p>
                <p style="font-size: 1rem; color: #444;">
                  Utilize o código abaixo para prosseguir com a redefinição:
                </p>
                <div style="font-size: 2.2rem; font-weight: bold; color: #2d9cdb; letter-spacing: 6px; background: #fff; border-radius: 8px; padding: 18px 0; margin: 28px 0 12px 0; text-align: center; border: 2px dashed #2d9cdb;">
                  ${codigo}
                </div>
                <div style="font-size: 0.95rem; color: #888; margin: 12px 0 24px 0; text-align: center;">
                  Selecione o código acima e copie para utilizar na redefinição de senha.
                </div>
                <p style="color: #888; font-size: 1rem;">
                  Este código é válido por tempo limitado e deve ser utilizado apenas por você.
                </p>
                <p style="color: #e74c3c; font-size: 0.95rem; margin-top: 18px;">
                  Se você não solicitou a alteração, nenhuma ação é necessária. Sua conta permanecerá segura.
                </p>
              </div>
              <div style="background: #f5f7fa; border-radius: 0 0 12px 12px; padding: 18px 24px; text-align: center;">
                <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 0 0 12px 0;">
                <p style="font-size: 0.95rem; color: #aaa; margin: 0;">
                  Este é um e-mail automático. Por favor, não responda.<br>
                  Controle de Estoque &copy; ${new Date().getFullYear()}
                </p>
              </div>
            </div>
          `,
        });
      } catch (error) {
        return res.status(500).json({
          erro: 'Erro ao enviar e-mail. Por favor, tente novamente mais tarde.',
        });
      }

      return res.status(200).json({
        mensagem: 'Mensagem enviada.',
      });
    } catch (error) {
      console.error('Erro em forgotPassword:', error);
      return res.status(500).json({
        erro: 'Erro interno ao processar a solicitação. Tente novamente mais tarde.',
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, codigo, novaSenha } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ erro: 'Código inválido ou expirado.' });
      }

      // Verifica se o código é válido e não expirou
      const now = new Date();
      const expirationDate = user.codigo_recuperacao_expiracao ? new Date(user.codigo_recuperacao_expiracao) : null;
      
      if (!user.codigo_recuperacao || user.codigo_recuperacao !== codigo || !expirationDate || now > expirationDate) {
        return res.status(400).json({ erro: 'Código inválido ou expirado.' });
      }

      const senhaHash = await bcrypt.hash(novaSenha, 8);
      
      await user.update({
        senha_hash: senhaHash,
        codigo_recuperacao: null,
        codigo_recuperacao_expiracao: null,
        tentativas_recuperacao: 0,
        ultima_tentativa_recuperacao: null
      });

      // Envia e-mail de confirmação de alteração de senha
      try {
        await sendEmail({
          to: email,
          subject: 'Senha alterada com sucesso – Controle de Estoque',
          text: `Olá,

Sua senha foi alterada com sucesso no sistema Controle de Estoque.

Se você realizou esta alteração, pode desconsiderar este e-mail. Caso não tenha sido você, entre em contato imediatamente com o suporte.

Atenciosamente,
Equipe Controle de Estoque`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; box-shadow: 0 4px 24px rgba(44,62,80,0.10);">
              <div style="background: #27ae60; border-radius: 12px 12px 0 0; padding: 32px 24px 16px 24px; text-align: center;">
                <img src="https://img.icons8.com/ios-filled/100/ffffff/ok--v1.png" alt="Senha Alterada" style="width: 60px; margin-bottom: 12px;" />
                <h1 style="color: #fff; margin: 0; font-size: 2.2rem;">Senha Alterada com Sucesso</h1>
              </div>
              <div style="padding: 32px 24px;">
                <p style="font-size: 1.1rem; color: #333;">Olá,</p>
                <p style="font-size: 1rem; color: #444;">
                  Informamos que a senha da sua conta no <strong>Controle de Estoque</strong> foi alterada com sucesso.
                </p>
                <p style="font-size: 1rem; color: #444;">
                  Agora você já pode acessar o sistema utilizando sua nova senha.
                </p>
                <p style="color: #e67e22; font-size: 0.95rem; margin-top: 18px;">
                  Se você não realizou esta alteração, entre em contato imediatamente com o suporte.
                </p>
              </div>
              <div style="background: #f5f7fa; border-radius: 0 0 12px 12px; padding: 18px 24px; text-align: center;">
                <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 0 0 12px 0;">
                <p style="font-size: 0.95rem; color: #aaa; margin: 0;">
                  Este é um e-mail automático. Por favor, não responda.<br>
                  Controle de Estoque &copy; ${new Date().getFullYear()}
                </p>
              </div>
            </div>
          `,
        });
      } catch (error) {
        // Não impede o fluxo, apenas loga o erro
        console.error('Erro ao enviar e-mail de confirmação de senha:', error);
      }

      return res
        .status(200)
        .json({ 
          mensagem: 'Senha redefinida com sucesso. Sua conta foi recuperada e a senha alterada. Agora você já pode acessar o sistema com sua nova senha.' 
        });
    } catch (error) {
      console.error('Erro em resetPassword:', error);
      return res.status(500).json({
        erro: 'Erro ao redefinir senha. Por favor, tente novamente mais tarde.',
      });
    }
  }
}

export default new AuthController();
