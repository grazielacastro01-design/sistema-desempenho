const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- CONEXÃO RAILWAY ---
const db = mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041 
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro no Railway:', err.message);
        return;
    }
    console.log('✅ CONECTADO AO BANCO!');
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    db.query(sql, [login, senha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            res.status(401).json({ message: "Incorreto" });
        }
    });
});

// --- ROTA DE CADASTRO DE USUÁRIO (Sprint 5) ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    
    db.query(sql, [nome, login, senha], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar:', err);
            return res.status(500).json({ error: "Erro ao salvar usuário." });
        }
        res.status(201).json({ message: "Sucesso" });
    });
});

// Rota para cadastrar pessoas/funcionários (Opcional para a Sprint 5, mas bom ter)
app.post('/cadastrar-funcionario', (req, res) => {
    const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;
    const sql = "INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nome, cpf, nascimento, telefone, pessoa_tipo_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Sucesso" });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});