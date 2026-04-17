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
    connectTimeout: 20000 
});

// ROTA DE LOGIN CORRIGIDA
app.post('/login', (req, res) => {
    const login = String(req.body.login || "").trim();
    const senha = String(req.body.senha || "").trim();

    console.log(`Tentativa de login: Usuário [${login}]`); 

    // Trocamos "id" por "usuario_id" para bater com a estrutura da sua tabela tbUsuarios
    const sql = "SELECT usuario_id, nome FROM tbUsuarios WHERE login = ? AND senha = ?";
    
    db.query(sql, [login, senha], (err, results) => {
        if (err) {
            console.error("Erro no Banco:", err); 
            return res.status(500).json({ error: "Erro interno no servidor" });
        }
        
        if (results && results.length > 0) {
            console.log("Login bem-sucedido!");
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            console.log("Login falhou: Usuário ou senha não conferem.");
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// ROTA DE CADASTRO
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    db.query(sql, [nome.trim(), login.trim(), senha.trim()], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Sucesso" });
    });
});

// ROTA DE COLABORADORES
app.get('/api/colaboradores', (req, res) => {
    const sql = "SELECT * FROM tbPessoas ORDER BY nome ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

module.exports = app;