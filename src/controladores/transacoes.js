const pool = require("../conexaoBanco");

const listarTransacoes = async (req, res) => {
    const { id } = req.usuario;

    try {
        const listaTransacoes = await pool.query('SELECT * FROM transacoes WHERE usuario_id = $1', [id])

        return res.status(200).json(listaTransacoes.rows); 
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const detalharTransacao = async (req, res) => {
    const { id } = req.params;

    try {
        const { id: usuarioId } = req.usuario;
        
        const query = 'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2';
        
        const transacao = await pool.query(query, [id, usuarioId]);

        if (transacao.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada' })
        }

        return res.status(200).json(transacao.rows[0])
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' })
    }
};

module.exports = {
    listarTransacoes,
    detalharTransacao
};
