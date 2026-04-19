const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// --- ROTAS DE USUÁRIOS E PESSOAS ---

app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: 'Incorreto' });
    } catch (error) { res.status(500).json({ error: 'Erro no servidor' }); }
});

app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome, telefone, nascimento, pessoa_tipo_id FROM tbPessoas ORDER BY pessoa_id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

app.post('/colaborador', async (req, res) => {
    const { nome, nascimento, telefone, pessoa_tipo_id } = req.body;
    try {
        const cpfFake = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
        const sql = 'INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)';
        await db.execute(sql, [nome, cpfFake, nascimento, telefone, pessoa_tipo_id]);
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao salvar' }); }
});

app.delete('/colaborador/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tbPessoas WHERE pessoa_id = ?', [id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

// --- NOVA ROTA: MÓDULO DE AVALIAÇÃO (SPRINT 8) ---

// Rota para salvar uma nova avaliação/feedback
app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    try {
        const dataHoje = new Date().toISOString().split('T')[0]; // Pega a data atual (AAAA-MM-DD)
        const statusPendente = 1; // ID 1 da sua tbAvaliacaoStatus

        const sql = 'INSERT INTO tbAvaliacao (data, observacao, funcionario_id, avaliacao_status_id) VALUES (?, ?, ?, ?)';
        await db.execute(sql, [dataHoje, observacao, funcionario_id, statusPendente]);
        
        res.status(201).json({ success: true, message: 'Avaliação registrada!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar avaliação' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 Servidor na porta ${port}`));