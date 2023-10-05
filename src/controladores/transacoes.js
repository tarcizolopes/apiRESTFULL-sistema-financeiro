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

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const usuario_id = req.usuario.id

    if (!tipo || !descricao || !valor || !data || !categoria_id) {
        return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
    }
    
    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(400).json({ mensagem: "O campo 'tipo' deve ser 'entrada' ou 'saida'." });
    }
    
    try {
        const query = `INSERT INTO transacoes (tipo, descricao, valor, data, categoria_id, usuario_id) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `
        const params = [tipo, descricao, valor, data, categoria_id, usuario_id];

        const { rows } = await pool.query(query, params);

        const categoria = await pool.query('SELECT descricao FROM categorias WHERE id = $1', [rows[0].categoria_id]);

        if (categoria.rowCount <= 0) {
            return res.status(400).json({ mensagem: 'A categoria não existe' });
        }
        
        transacao = {
            id: rows[0].id,
            tipo: rows[0].tipo,
            descricao: rows[0].descricao,
            valor: rows[0].valor,
            data: rows[0].data,
            usuario_id: rows[0].usuario_id,
            categoria_id: rows[0].categoria_id,
            categoria_nome: categoria.rows[0].descricao
        };

        return res.status(201).json(transacao);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const atualizarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const { id: transacao_id } = req.params;
    
    if (!tipo || !descricao || !valor || !data || !categoria_id) {
        return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
    }
    
    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(400).json({ mensagem: "O campo 'tipo' deve ser 'entrada' ou 'saida'." });
    }

    try {
        const { rowCount: transacao } = await pool.query('SELECT * FROM transacoes WHERE id = $1', [transacao_id]);

        if (transacao <= 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada' })
        }

        const { rowCount: categoria } = await pool.query('SELECT * FROM categorias WHERE id = $1',[categoria_id]);

        if (categoria <= 0) {
            return res.status(404).json({ mensagem: 'Categoria inválida' })
        }

        const query = `UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5
            WHERE id = $6 RETURNING *
        `
        const params = [descricao, valor, data, categoria, tipo, transacao_id];

        await pool.query(query, params);

        return res.status(201).json();

    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const deletarTrasacao = async (req, res) => {
    const { id: usuario_id } = req.usuario;
    const { id: transacao_id } = req.params;

    try {
        const query = 'SELECT * FROM transacoes WHERE id = $1'
        
        const { rowCount: transacao } = await pool.query(query, [transacao_id]);
        
        if (transacao <= 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada' })
        }

        await pool.query('DELETE FROM transacoes WHERE id = $1  AND usuario_id = $2', [transacao_id, usuario_id])

        return res.status(204).json()
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const obterExtratoTransacoes = async (req, res) => {
    const { id } = req.usuario;

    try {
        const query = {
            text: `SELECT
                      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS entrada,
                      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS saida
                  FROM transacoes
                  WHERE usuario_id = $1`,
            values: [id],
        };

        const { rows } = await pool.query(query);


        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTrasacao,
    obterExtratoTransacoes
};
