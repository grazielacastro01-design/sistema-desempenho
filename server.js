const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Configurações de Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Conexão com o Banco de Dados (Railway)
const db = mysql.createPool({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // Aumenta o tempo para evitar Timeout na Vercel
});

// --- ROTA DE LOGIN (Com tratamento de espaços) ---
app.post('/login', (req, res) => {
    // O .trim() remove espaços acidentais que impedem o login
    const login = req.body.login ? req.body.login.trim() : "";
    const senha = req.body.senha ? req.body.senha.trim() : "";

    if (!login || !senha) {
        return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
    }

    const sql = "SELECT id, nome FROM tbUsuarios WHERE login = ? AND senha = ?";
    db.query(sql, [login, senha], (err, results) => {
        if (err) {
            console.error("Erro no Banco:", err);
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
        
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// --- ROTA DE CADASTRO ---
app.post('/cadastrar-usuario', (req, res) => {
    const nome = req.body.nome ? req.body.nome.trim() : "";
    const login = req.body.login ? req.body.login.trim() : "";
    const senha = req.body.senha ? req.body.senha.trim() : "";

    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    db.query(sql, [nome, login, senha], (err) => {
        if (err) {
            console.error("Erro ao cadastrar:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Sucesso" });
    });
});

// --- ROTA DE COLABORADORES (Listagem para o Sistema de Desempenho) ---
app.get('/api/colaboradores', (req, res) => {
    const sql = "SELECT id, nome, cargo, area FROM tbPessoas ORDER BY nome ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// IMPORTANTE PARA VERCEL: Exportar o app em vez de usar app.listen
module.exports = app;