const pool = require("../conexaoBanco");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const senhajwt = require('../senhajwt');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const usuarioComEmailExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (usuarioComEmailExistente.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *'

        const { rows } = await pool.query(query, [nome, email, senhaCriptografada]);

        const {senha: _, ...usuario} = rows[0];

        return res.status(201).json(usuario);

    } catch (error) {
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { rows, rowCount } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (rowCount === 0) {
            return res.status(401).json({ mensagem: 'Usuário e/ou senha inválido(s).' })
        }

        const { senha: senhaUsuario, ...usuario } = rows[0]
        
        const senhaCorreta = await bcrypt.compare(senha, senhaUsuario);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Usuário e/ou senha inválido(s).' })
        }

        const token = jwt.sign({ id: usuario.id }, senhajwt, { expiresIn: '8h' });

        res.status(200).json({
            usuario,
            token
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ mensagem: 'Erro interno do servidor.'})
    }
};

module.exports = {
    cadastrarUsuario,
    login
};