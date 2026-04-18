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
app.get('/colaborador/:id', (req, res) => {
    const { id } = req.params;
    
    // Usando db.query (Pool) e garantindo que o nome da tabela seja tbPessoas
    db.query('SELECT * FROM tbPessoas WHERE pessoa_id = ?', [id], (err, results) => {
        if (err) {
            console.error("Erro no Banco:", err);
            return res.status(500).json({ error: "Erro interno no servidor", details: err });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Colaborador não encontrado" });
        }
        
        // Retorna os dados do colaborador (nome, cargo, etc)
        res.json(results[0]);
    });
});

// Rota de teste
app.get('/', (req, res) => res.send('API SD PERFORMANCE RODANDO!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

module.exports = app;