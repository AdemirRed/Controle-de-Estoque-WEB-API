/* eslint-disable no-unused-vars */
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import Pedido from '../models/Pedido';
import RelatorioPedido from '../models/RelatorioPedido';

// Definir o diretório base para salvar os relatórios
const BASE_DIR = path.resolve(__dirname, '..', '..', '..', 'uploads', 'relatorios');

// Criar diretório se não existir
if (!fs.existsSync(BASE_DIR)){
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

/**
 * Controller para gerenciamento de relatórios de pedidos
 */
class RelatorioPedidoController {
  /**
   * Lista todos os relatórios de pedidos
   */
  async index(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const relatorios = await RelatorioPedido.findAndCountAll({
        order: [['created_at', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      return res.json({
        relatorios: relatorios.rows,
        total: relatorios.count,
        pages: Math.ceil(relatorios.count / limit),
        currentPage: page,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar relatórios' });
    }
  }

  /**
   * Retorna um relatório de pedido específico
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const relatorio = await RelatorioPedido.findByPk(id);

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      return res.json(relatorio);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
  }

  /**
   * Cria um novo relatório de pedido
   */
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        periodo_inicio: Yup.date().required(),
        periodo_fim: Yup.date().required(),
        parametros: Yup.object().shape({
          status: Yup.string()
        }),
        caminho_arquivo: Yup.string()
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Falha na validação' });
      }

      const { periodo_inicio, periodo_fim, parametros } = req.body;

      // Verifica se o período final é maior que o inicial
      if (new Date(periodo_fim) <= new Date(periodo_inicio)) {
        return res.status(400).json({ 
          error: 'O período final deve ser maior que o período inicial' 
        });
      }

      // Ajusta o fuso horário para UTC
      const dataInicio = new Date(periodo_inicio);
      const dataFim = new Date(periodo_fim);
      
      // Busca pedidos do período para gerar relatório
      const pedidos = await Pedido.findAll({
        where: {
          created_at: {
            [Op.between]: [dataInicio, dataFim],
          },
          ...(parametros?.status && { status: parametros.status })
        },
      });

      // Gera nome do arquivo
      const nomeArquivo = `relatorio_pedidos_${new Date().getTime()}.pdf`;
      const caminhoCompleto = path.join(BASE_DIR, nomeArquivo);
      
      // Cria o PDF
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(caminhoCompleto);
      
      doc.pipe(stream);

      // Cabeçalho do relatório
      doc.fontSize(20).text('Relatório de Pedidos', { align: 'center' });
      doc.moveDown();
      
      // Informações do período
      doc.fontSize(12)
        .text(`Período: ${dataInicio.toLocaleDateString()} a ${dataFim.toLocaleDateString()}`);
      doc.text(`Status: ${parametros?.status || 'Todos'}`);
      doc.text(`Total de pedidos: ${pedidos.length}`);
      doc.moveDown();

      // Tabela de pedidos
      pedidos.forEach((pedido, index) => {
        const valorTotal = typeof pedido.valor_total === 'string' 
          ? parseFloat(pedido.valor_total) 
          : pedido.valor_total;

        doc.text(`Pedido ${index + 1}:`)
          .text(`ID: ${pedido.id}`)
          .text(`Item: ${pedido.item_nome}`)
          .text(`Quantidade: ${pedido.quantidade}`)
          .text(`Valor Total: R$ ${valorTotal ? valorTotal.toFixed(2) : '0.00'}`)
          .text(`Status: ${pedido.status}`)
          .text(`Data: ${new Date(pedido.created_at).toLocaleDateString()}`)
          .moveDown();
      });

      // Rodapé
      doc.text(`Relatório gerado em: ${new Date().toLocaleString()}`, {
        align: 'right'
      });

      // Finaliza o PDF
      doc.end();

      // Aguarda o PDF ser salvo
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      const relatorio = await RelatorioPedido.create({
        id: uuidv4(),
        usuario_id: req.userId, // Garante que o usuário_id seja salvo
        periodo_inicio: dataInicio,
        periodo_fim: dataFim,
        parametros,
        caminho_arquivo: caminhoCompleto,
        gerado_em: new Date(),
      });

      return res.status(201).json(relatorio);
    } catch (error) {
      console.error(error); // Adiciona log para debug
      return res.status(500).json({ error: 'Erro ao criar relatório' });
    }
  }

  /**
   * Atualiza um relatório de pedido existente
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const relatorio = await RelatorioPedido.findByPk(id);

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      const schema = Yup.object().shape({
        periodo_inicio: Yup.date(),
        periodo_fim: Yup.date(),
        parametros: Yup.object(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Falha na validação' });
      }

      await relatorio.update(req.body);

      return res.json(relatorio);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar relatório' });
    }
  }

  /**
   * Remove um relatório de pedido do sistema
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const relatorio = await RelatorioPedido.findByPk(id);

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      // Remove o arquivo físico
      if (fs.existsSync(relatorio.caminho_arquivo)) {
        fs.unlinkSync(relatorio.caminho_arquivo);
      }

      await relatorio.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar relatório' });
    }
  }
}

export default new RelatorioPedidoController();
