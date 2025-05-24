import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';

import AuthController from './app/controllers/AuthController';
import authMiddleware from './app/middlewares/authMiddleware';
import isAdmin from './app/middlewares/isAdminMiddleware'; // Middleware de admin

import CategoriaController from './app/controllers/CategoriaController';
import FornecedorController from './app/controllers/FornecedorController';
import ItemController from './app/controllers/ItemController';
import MovimentacaoEstoqueController from './app/controllers/MovimentacaoEstoqueController';
import PedidoController from './app/controllers/PedidoController';
import RelatorioPedidoController from './app/controllers/RelatorioPedidoController';
import UnidadeMedidaController from './app/controllers/UnidadeMedidaController';

const routes = new Router();

// Rota pública para login
routes.post('/sessao', SessionController.store); // [POST] Login do usuário

// Rota pública para criar primeiro usuário (admin inicial, se quiser)
routes.post('/usuarios', UserController.store); // [POST] Criação de usuário

routes.post('/esqueci-senha', AuthController.forgotPassword); // [POST] Solicitar redefinição de senha
routes.post('/redefinir-senha', AuthController.resetPassword); // [POST] Redefinir senha
routes.post('/verificar-email', UserController.verifyEmail); // [POST] Verificar existência de email

// Aplicar middleware para proteger todas as rotas abaixo:
routes.use(authMiddleware);

// Rotas protegidas

// Usuários
routes.get('/usuarios', isAdmin, UserController.index); // [GET] Listar todos os usuários (admin)
routes.get('/usuarios/:id',  UserController.show); // [GET] Detalhar usuário

// Categorias
routes.get('/categorias', CategoriaController.index); // [GET] Listar categorias
routes.get('/categorias/:id', CategoriaController.show); // [GET] Detalhar categoria
routes.post('/categorias', CategoriaController.store); // [POST] Criar categoria
routes.put('/categorias/:id', CategoriaController.update); // [PUT] Atualizar categoria
routes.delete('/categorias/:id', CategoriaController.delete); // [DELETE] Remover categoria

// Fornecedores
routes.get('/fornecedores', FornecedorController.index); // [GET] Listar fornecedores
routes.get('/fornecedores/:id', FornecedorController.show); // [GET] Detalhar fornecedor
routes.post('/fornecedores', FornecedorController.store); // [POST] Criar fornecedor
routes.put('/fornecedores/:id', FornecedorController.update); // [PUT] Atualizar fornecedor
routes.delete('/fornecedores/:id', FornecedorController.delete); // [DELETE] Remover fornecedor

// Itens
routes.get('/itens', ItemController.index); // [GET] Listar itens
routes.get('/itens/:id', ItemController.show); // [GET] Detalhar item
routes.post('/itens', ItemController.store); // [POST] Criar item
routes.put('/itens/:id', ItemController.update); // [PUT] Atualizar item
routes.delete('/itens/:id', ItemController.delete); // [DELETE] Remover item

// Unidades de Medida
routes.get('/unidades-medida', UnidadeMedidaController.index); // [GET] Listar unidades de medida
routes.get('/unidades-medida/:id', UnidadeMedidaController.show); // [GET] Detalhar unidade de medida
routes.post('/unidades-medida', UnidadeMedidaController.store); // [POST] Criar unidade de medida
routes.put('/unidades-medida/:id', UnidadeMedidaController.update); // [PUT] Atualizar unidade de medida
routes.delete('/unidades-medida/:id', UnidadeMedidaController.delete); // [DELETE] Remover unidade de medida

// Pedidos
routes.get('/pedidos', PedidoController.index); // [GET] Listar pedidos
routes.get('/pedidos/:id', PedidoController.show); // [GET] Detalhar pedido
routes.post('/pedidos', PedidoController.store); // [POST] Criar pedido
routes.put('/pedidos/:id', PedidoController.update); // [PUT] Atualizar pedido
routes.delete('/pedidos/:id', PedidoController.delete); // [DELETE] Remover pedido
routes.put('/pedidos/:id/aprovar', PedidoController.aprovar); //[PUT] Atualizar pedido

// Movimentações de Estoque
routes.get('/movimentacoes-estoque', MovimentacaoEstoqueController.index); // [GET] Listar movimentações de estoque
routes.get('/movimentacoes-estoque/:id', MovimentacaoEstoqueController.show); // [GET] Detalhar movimentação de estoque
routes.post('/movimentacoes-estoque', MovimentacaoEstoqueController.store); // [POST] Criar movimentação de estoque
routes.put('/movimentacoes-estoque/:id', MovimentacaoEstoqueController.update); // [PUT] Atualizar movimentação de estoque
routes.delete('/movimentacoes-estoque/:id', MovimentacaoEstoqueController.delete); // [DELETE] Remover movimentação de estoque

// Relatórios de Pedido
routes.get('/relatorios-pedidos', RelatorioPedidoController.index); // [GET] Listar relatórios de pedidos
routes.get('/relatorios-pedidos/:id', RelatorioPedidoController.show); // [GET] Detalhar relatório de pedido
routes.post('/relatorios-pedidos', RelatorioPedidoController.store); // [POST] Criar relatório de pedido
routes.put('/relatorios-pedidos/:id', RelatorioPedidoController.update); // [PUT] Atualizar relatório de pedido
routes.delete('/relatorios-pedidos/:id', RelatorioPedidoController.delete); // [DELETE] Remover relatório de pedido

export default routes;
