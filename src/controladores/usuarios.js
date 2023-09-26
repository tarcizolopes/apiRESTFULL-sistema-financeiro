const bcrypt = require('bcrypt');
const pool = require('../conexaoBanco');

const detalharUsuario = async (req, res) => {
    return res.status(200).json(req.usuario);
    //inserir mensagem de erro
};

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { id } = req.usuario;

        const { rowCount: conferirEmail } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        if (conferirEmail) {
            return res.status(400).json({ mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.' });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);
        
        const query = 'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4';
        await pool.query(query, [nome,  email, senhaCriptografada, id]); 

        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    detalharUsuario,
    atualizarUsuario
};
