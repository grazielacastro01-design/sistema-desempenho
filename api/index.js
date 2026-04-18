const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// --- CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// --- CONEXÃO COM O BANCO DE DADOS (RAILWAY) ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 30041,
    ssl: { rejectUnauthorized: false }, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 
});

// Teste de conexão automático
db.getConnection((err, connection) => {
    if (err) {
        console.error("ERRO CRÍTICO NO BANCO:", err.message);
    } else {
        console.log("CONECTADO AO RAILWAY COM SUCESSO!");
        connection.release();
    }
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    
    db.query(sql, [login, senha], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            // Retorna o usuário encontrado para salvar no localStorage
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// --- ROTA DO DASHBOARD (COLABORADOR) ---
// Rota para LISTAR (GET)
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome, cargo FROM tbPessoas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Rota para CADASTRAR (POST)
app.post('/colaborador', async (req, res) => {
    const { nome, cargo } = req.body;
    try {
        // Importante:pessoa_tipo_id 5 é o padrão para colaborador no seu banco
        const sql = 'INSERT INTO tbPessoas (nome, cargo, pessoa_tipo_id) VALUES (?, ?, 5)';
        await db.execute(sql, [nome, cargo]);
        res.status(201).json({ message: "Cadastrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});