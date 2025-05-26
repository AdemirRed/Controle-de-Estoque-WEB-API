import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';

import authMiddleware from './app/middlewares/authMiddleware';
import isAdmin from './app/middlewares/isAdminMiddleware'; // Middleware de admin

import CategoriaController from './app/controllers/CategoriaController';
import FornecedorController from './app/controllers/FornecedorController';
import ItemController from './app/controllers/ItemController';
import ItemRequestController from './app/controllers/ItemRequestController';
import MovimentacaoEstoqueController from './app/controllers/MovimentacaoEstoqueController';
import PedidoController from './app/controllers/PedidoController';
import PushNotificationController from './app/controllers/PushNotificationController';
import RelatorioPedidoController from './app/controllers/RelatorioPedidoController';
import UnidadeMedidaController from './app/controllers/UnidadeMedidaController';

const routes = new Router();

// Rota pública para login
routes.post('/sessao', SessionController.store); // [POST] Login do usuário

// Rota pública para criar primeiro usuário (admin inicial, se quiser)
routes.post('/usuarios', UserController.store); // [POST] Criação de usuário

// Removidas rotas de recuperação de senha e verificação de email
// routes.post('/esqueci-senha', AuthController.forgotPassword); // [POST] Solicitar redefinição de senha
// routes.post('/redefinir-senha', AuthController.resetPassword); // [POST] Redefinir senha
// routes.post('/verificar-email', UserController.verifyEmail); // [POST] Verificar existência de email

// Aplicar middleware para proteger todas as rotas abaixo:
routes.use(authMiddleware);

// Rotas protegidas

// Usuários (todas as operações de usuário restritas a admin)
routes.get('/usuarios', isAdmin, UserController.index); // [GET] Listar todos os usuários (admin)
routes.get('/usuarios/:id', UserController.show); // [GET] Detalhar usuário
routes.put('/usuarios/:id', isAdmin, UserController.update); // [PUT] Atualizar usuário
routes.delete('/usuarios/:id', isAdmin, UserController.delete); // [DELETE] Remover usuário

// Categorias (criação, atualização e remoção restritas a admin)
routes.get('/categorias', CategoriaController.index); // [GET] Listar categorias
routes.get('/categorias/:id', CategoriaController.show); // [GET] Detalhar categoria
routes.post('/categorias', isAdmin, CategoriaController.store); // [POST] Criar categoria
routes.put('/categorias/:id', isAdmin, CategoriaController.update); // [PUT] Atualizar categoria
routes.delete('/categorias/:id', isAdmin, CategoriaController.delete); // [DELETE] Remover categoria

// Fornecedores (criação, atualização e remoção restritas a admin)
routes.get('/fornecedores', FornecedorController.index); // [GET] Listar fornecedores
routes.get('/fornecedores/:id', FornecedorController.show); // [GET] Detalhar fornecedor
routes.post('/fornecedores', isAdmin, FornecedorController.store); // [POST] Criar fornecedor
routes.put('/fornecedores/:id', isAdmin, FornecedorController.update); // [PUT] Atualizar fornecedor
routes.delete('/fornecedores/:id', isAdmin, FornecedorController.delete); // [DELETE] Remover fornecedor

// Itens JA ESTÁ FEITO
routes.get('/itens', ItemController.index); // [GET] Listar itens
routes.get('/itens/:id', ItemController.show); // [GET] Detalhar item
routes.post('/itens', ItemController.store); // [POST] Criar item
routes.put('/itens/:id', ItemController.update); // [PUT] Atualizar item
routes.delete('/itens/:id', ItemController.delete); // [DELETE] Remover item

// Unidades de Medida (todas as operações restritas a admin)
routes.get('/unidades-medida', UnidadeMedidaController.index); // [GET] Listar unidades de medida
routes.get('/unidades-medida/:id', UnidadeMedidaController.show); // [GET] Detalhar unidade de medida
routes.post('/unidades-medida', isAdmin, UnidadeMedidaController.store); // [POST] Criar unidade de medida
routes.put('/unidades-medida/:id', isAdmin, UnidadeMedidaController.update); // [PUT] Atualizar unidade de medida
routes.delete('/unidades-medida/:id', isAdmin, UnidadeMedidaController.delete); // [DELETE] Remover unidade de medida

// Pedidos
routes.get('/pedidos', PedidoController.index); // [GET] Listar pedidos
routes.get('/pedidos/:id', PedidoController.show); // [GET] Detalhar pedido
routes.post('/pedidos', PedidoController.store); // [POST] Criar pedido
routes.put('/pedidos/:id', isAdmin, PedidoController.update); // [PUT] Atualizar pedido (incluindo status)
routes.delete('/pedidos/:id', PedidoController.delete); // [DELETE] Remover pedido

// Movimentações de Estoque
routes.get('/movimentacoes-estoque', MovimentacaoEstoqueController.index); // [GET] Listar movimentações de estoque
routes.get('/movimentacoes-estoque/:id', MovimentacaoEstoqueController.show); // [GET] Detalhar movimentação de estoque
routes.post('/movimentacoes-estoque', MovimentacaoEstoqueController.store); // [POST] Criar movimentação de estoque
routes.delete('/movimentacoes-estoque/:id', MovimentacaoEstoqueController.delete); // [DELETE] Remover movimentação de estoque
// routes.put('/movimentacoes-estoque/:id', MovimentacaoEstoqueController.update); // Removida rota de atualização

// Relatórios de Pedido (todas as operações restritas a admin)
routes.get('/relatorios-pedidos', isAdmin, RelatorioPedidoController.index); // [GET] Listar relatórios de pedidos
routes.get('/relatorios-pedidos/:id', isAdmin, RelatorioPedidoController.show); // [GET] Detalhar relatório de pedido
routes.post('/relatorios-pedidos', isAdmin, RelatorioPedidoController.store); // [POST] Criar relatório de pedido
routes.put('/relatorios-pedidos/:id', isAdmin, RelatorioPedidoController.update); // [PUT] Atualizar relatório de pedido
routes.delete('/relatorios-pedidos/:id', isAdmin, RelatorioPedidoController.delete); // [DELETE] Remover relatório de pedido

// Requisições de Itens
routes.post('/item-requests', ItemRequestController.store); // Usuário faz requisição de item
routes.get('/item-requests/minhas', ItemRequestController.userRequests); // Usuário vê suas requisições
routes.get('/item-requests', isAdmin, ItemRequestController.index); // Admin vê todas as requisições
routes.get('/item-requests/:id', ItemRequestController.show); // Detalhar requisição específica
routes.put('/item-requests/:id', isAdmin, ItemRequestController.update); // Admin altera status
routes.delete('/item-requests/:id',  ItemRequestController.delete); // Admin apaga requisição

// Notificações Push
routes.post('/push-subscriptions', PushNotificationController.subscribe); // Salvar subscription do usuário logado
routes.post('/push-notify', isAdmin, PushNotificationController.notifyAdmins); // Enviar notificação para todos admins

export default routes;
