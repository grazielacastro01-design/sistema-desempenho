const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

const db = mysql.createPool({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 15000 
});

// ROTA DE LOGIN CORRIGIDA
app.post('/login', (req, res) => {
    // .trim() remove espaços antes e depois
    const login = req.body.login ? req.body.login.trim() : "";
    const senha = req.body.senha ? req.body.senha.trim() : "";

    // LOWER(login) faz o banco ignorar se você digitou maiúsculo ou minúsculo
    const sql = "SELECT id, nome FROM tbUsuarios WHERE LOWER(login) = LOWER(?) AND senha = ?";
    
    db.query(sql, [login, senha], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro no banco" });
        
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// ROTA DE CADASTRO CORRIGIDA
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    
    // Limpamos os dados antes de salvar no banco
    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    db.query(sql, [nome.trim(), login.trim(), senha.trim()], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Sucesso" });
    });
});

module.exports = app;