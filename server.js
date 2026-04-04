const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// --- CONEXÃO RAILWAY (Dados da sua imagem) ---
const db = mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041 
});

db.connect((err) => {
    if (err) return console.error('❌ Erro Railway:', err.message);
    console.log('✅ Banco de Dados Conectado!');
});

// --- ROTA DE CADASTRO (Sprint 5) ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    // Usando as colunas: nome, login, senha (conforme sua imagem do Railway)
    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    
    db.query(sql, [nome, login, senha], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao salvar" });
        }
        res.status(201).json({ message: "Sucesso" });
    });
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    db.query(sql, [login, senha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        results.length > 0 ? res.status(200).json({ message: "Sucesso" }) : res.status(401).json({ message: "Erro" });
    });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`🚀 Servidor na porta ${port}`));