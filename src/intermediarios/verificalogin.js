const jwt = require('jsonwebtoken');
const senhajwt = require('../senhajwt');
const pool = require('../conexaoBanco');

const verificaLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ mensagem: 'Usuário não autorizado' });
    }

    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, senhajwt);

        const { rows, rowCount } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(401).json({ mensagem: 'Usuário não autorizado' });
        }

        const { senha, ...usuario} = rows[0];
        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(401).json({ mensagem: 'Usuário não autorizado' });
    }
};

module.exports = {
    verificaLogin
};
