const express = require('express');
const { cadastrarUsuario, login } = require('./controladores/controlador');
const { verificaLogin } = require('./intermediarios/verificalogin');
const { detalharUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { listarCategorias } = require('./controladores/categorias');
const { listarTransacoes, detalharTransacao, cadastrarTransacao, atualizarTransacao, deletarTrasacao, obterExtratoTransacoes } = require('./controladores/transacoes');

const rotas = express();

rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', login);

rotas.use(verificaLogin);

rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);

rotas.get('/categoria', listarCategorias)
rotas.get('/transacao/extrato', obterExtratoTransacoes);
rotas.get('/transacao', listarTransacoes);
rotas.post('/transacao', cadastrarTransacao);
rotas.get('/transacao/:id', detalharTransacao);
rotas.put('/transacao/:id', atualizarTransacao);
rotas.delete('/transacao/:id', deletarTrasacao)

module.exports = rotas;
