const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Configuração de CORS para permitir acesso da Vercel
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Pool de conexão com variáveis do Railway
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// Rota de Login
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: 'Incorreto' });
    } catch (error) { res.status(500).json({ error: 'Erro' }); }
});

// Rota de Listagem (Usando os nomes de coluna da sua imagem)
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY pessoa_id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

// Rota de Cadastro (Resolvendo o erro de campos obrigatórios)
app.post('/colaborador', async (req, res) => {
    const { nome } = req.body;
    try {
        const sql = 'INSERT INTO tbPessoas (nome, cpf, nascimento, pessoa_tipo_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [
            nome, 
            '000.000.000-00', // CPF padrão para não dar erro
            '2000-01-01',     // Data padrão para não dar erro
            1                 // pessoa_tipo_id conforme sua tabela
        ]);
        res.status(201).json({ id: result.insertId, message: 'Sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 Porta: ${port}`));