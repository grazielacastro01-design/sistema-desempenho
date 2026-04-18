const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// 1. CONFIGURAÇÃO DO CORS (Adicionado aqui no topo)
app.use(cors({
    origin: '*', // Permite que qualquer site (Vercel ou localhost) acesse
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. CONFIGURAÇÃO DO BANCO DE DADOS (Usando variáveis de ambiente)
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão para ver nos Logs do Railway
db.getConnection()
    .then(() => console.log("✅ Conectado ao MySQL com sucesso!"))
    .catch(err => console.error("❌ Erro de conexão no banco:", err));

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?',
            [login, senha]
        );

        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor de login' });
    }
});

// --- ROTA DE LISTAGEM DE COLABORADORES ---
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome, cargo FROM tbPessoas');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// --- ROTA DE CADASTRO DE COLABORADOR ---
app.post('/colaborador', async (req, res) => {
    const { nome, cargo } = req.body;
    try {
        // pessoa_tipo_id = 5 é o padrão para colaborador no seu banco
        const sql = 'INSERT INTO tbPessoas (nome, cargo, pessoa_tipo_id) VALUES (?, ?, 5)';
        const [result] = await db.execute(sql, [nome, cargo]);
        res.status(201).json({ id: result.insertId, message: 'Cadastrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar colaborador no banco' });
    }
});

// 3. INICIALIZAÇÃO DO SERVIDOR
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});