const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// LOGIN, LISTAR COLABORADORES E SALVAR (Mantidos iguais...)
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/colaboradores', async (req, res) => {
    const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
    res.json(rows);
});

app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    const data = new Date().toISOString().split('T')[0];
    const sql = 'INSERT INTO tbAvaliacao (data, observacao, funcionario_id, avaliacao_status_id, atualizado_por, atualizado_em) VALUES (?, ?, ?, 1, 5, NOW())';
    await db.execute(sql, [data, observacao, funcionario_id]);
    res.json({ success: true });
});

// LISTAR HISTÓRICO
app.get('/listar-avaliacoes', async (req, res) => {
    const sql = 'SELECT a.avaliacao_id, a.data, a.observacao, p.nome as nome_colaborador FROM tbAvaliacao a JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id ORDER BY a.data DESC';
    const [rows] = await db.execute(sql);
    res.json(rows);
});

// EXCLUIR
app.delete('/avaliacao/:id', async (req, res) => {
    await db.execute('DELETE FROM tbAvaliacao WHERE avaliacao_id = ?', [req.params.id]);
    res.json({ success: true });
});

// --- NOVO: ATUALIZAR/EDITAR AVALIAÇÃO ---
app.put('/avaliacao/:id', async (req, res) => {
    const { id } = req.params;
    const { observacao } = req.body;
    try {
        await db.execute('UPDATE tbAvaliacao SET observacao = ?, atualizado_em = NOW() WHERE avaliacao_id = ?', [observacao, id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Rodando na porta ${port}`));