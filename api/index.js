const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// --- CONFIGURAÇÃO DO CORS ---
// Permite que sua página na Vercel acesse este servidor no Railway
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
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

// Verificação de conexão nos Logs do Railway
db.getConnection()
    .then(() => console.log("✅ Banco conectado com sucesso!"))
    .catch(err => console.error("❌ Erro ao conectar no banco:", err));

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
        console.error("Erro no servidor:", error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// --- ROTA DE LISTAGEM ---
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome, cargo FROM tbPessoas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// --- ROTA DE CADASTRO ---
app.post('/colaborador', async (req, res) => {
    const { nome, cargo } = req.body;
    try {
        const sql = 'INSERT INTO tbPessoas (nome, cargo, pessoa_tipo_id) VALUES (?, ?, 5)';
        const [result] = await db.execute(sql, [nome, cargo]);
        res.status(201).json({ id: result.insertId, message: 'Cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar no banco' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});