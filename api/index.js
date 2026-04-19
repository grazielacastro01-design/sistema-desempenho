const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// TESTE DE CONEXÃO
db.getConnection().then(() => console.log("✅ Conexão com MySQL ativa!"));

// LOGIN
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: 'Incorreto' });
    } catch (error) { res.status(500).json({ error: 'Erro' }); }
});

// LISTAGEM
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY pessoa_id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

// CADASTRO (COM CPF DINÂMICO)
app.post('/colaborador', async (req, res) => {
    const { nome } = req.body;
    try {
        const cpfFake = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
        const sql = 'INSERT INTO tbPessoas (nome, cpf, nascimento, pessoa_tipo_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [nome, cpfFake, '2000-01-01', 1]);
        res.status(201).json({ id: result.insertId, message: 'Sucesso' });
    } catch (error) { res.status(500).json({ error: 'Erro ao salvar' }); }
});

// EXCLUSÃO (NOVA ROTA)
app.delete('/colaborador/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tbPessoas WHERE pessoa_id = ?', [id]);
        res.json({ success: true, message: 'Excluído' });
    } catch (error) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 Porta: ${port}`));