const pool = require("../conexaoBanco");

const listarCategorias = async (req, res) => {
    try {
        const listaCategorias = await pool.query('SELECT * FROM categorias');

        return res.status(200).json(listaCategorias.rows);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
};

module.exports = {
    listarCategorias
};