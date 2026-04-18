const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONEXÃO USANDO VARIÁVEIS DE AMBIENTE DA VERCEL ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST,         // shuttle.proxy.rlwy.net
    user: process.env.MYSQLUSER,         // root
    password: process.env.MYSQLPASSWORD, // Sua senha do Railway
    database: process.env.MYSQLDATABASE, // railway
    port: process.env.MYSQLPORT || 30041,
    ssl: { rejectUnauthorized: false },  // Essencial para aceitar conexões externas do Railway
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 
});

// Teste de conexão ao iniciar
db.getConnection((err, connection) => {
    if (err) {
        console.error("ERRO CRÍTICO NO BANCO:", err.message);
    } else {
        console.log("CONECTADO AO RAILWAY COM SUCESSO!");
        connection.release();
    }
});

app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    
    db.query(sql, [login, senha], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    // Ajustado para o nome real da sua tabela: tbPessoas
    const query = 'SELECT * FROM tbPessoas WHERE pessoa_id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erro no Banco:", err);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Colaborador não encontrado' });
        }
        // Retorna o resultado encontrado no banco
        res.json(result[0]);
    });
});