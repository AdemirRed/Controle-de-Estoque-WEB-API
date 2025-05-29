import 'dotenv/config';
import sendEmail from './mailer.js';

async function testarEnvioEmail() {
  try {
    await sendEmail({
      to: process.env.EMAIL_TEST_TO || process.env.EMAIL_USER,
      subject: '✅ Teste de Envio de E-mail',
      text: 'Este é um teste simples de envio de e-mail usando o utilitário sendEmail.',
      html: '<b>Este é um teste simples de envio de e-mail usando o utilitário <code>sendEmail</code>.</b>',
    });
    //console.log('✅ E-mail enviado com sucesso!');
  } catch (error) {
    console.error('❌ Falha ao enviar e-mail:', error);
  }
}

testarEnvioEmail();
