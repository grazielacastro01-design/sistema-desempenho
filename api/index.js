const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com Railway usando variáveis de ambiente
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// LOGIN
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    } catch (error) { res.status(500).json({ error: 'Erro no servidor' }); }
});

// LISTAR COLABORADORES
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

// LISTAR HISTÓRICO DE AVALIAÇÕES (Para a página avaliacoes.html)
app.get('/listar-avaliacoes', async (req, res) => {
    try {
        const sql = `
            SELECT a.data, a.observacao, p.nome as nome_colaborador 
            FROM tbAvaliacao a
            JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id
            ORDER BY a.data DESC
        `;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar histórico' }); }
});

// SALVAR AVALIAÇÃO - AJUSTADO PARA O DIAGRAMA
app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        const statusId = 1; // ID 'Pendente' na tbAvaliacaoStatus
        const usuarioLogadoId = 5; // Seu ID (Graziela) para satisfazer a FK de atualizado_por

        const sql = `
            INSERT INTO tbAvaliacao 
            (data, observacao, funcionario_id, avaliacao_status_id, atualizado_por, atualizado_em) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        await db.execute(sql, [dataHoje, observacao, funcionario_id, statusId, usuarioLogadoId]);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message);
        res.status(500).json({ error: 'Erro no Banco: ' + error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${port}`));