const express = require('express');
const { cadastrarUsuario, login } = require('./controladores/controlador');
const { verificaLogin } = require('./intermediarios/verificalogin');
const { detalharUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { listarCategorias } = require('./controladores/categorias');
const { listarTransacoes, detalharTransacao, cadastrarTransacao, atualizarTransacao } = require('./controladores/transacoes');

const rotas = express();

rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', login);

rotas.use(verificaLogin);

rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);

rotas.get('/categoria', listarCategorias)

rotas.get('/transacao', listarTransacoes);
rotas.get('/transacao/:id', detalharTransacao);
rotas.post('/transacao', cadastrarTransacao);
rotas.put('/transacao/:id', atualizarTransacao);

module.exports = rotas;
