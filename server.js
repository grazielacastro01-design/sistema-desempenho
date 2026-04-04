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

// --- CONEXÃO RAILWAY ---
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

// --- ROTA DE CADASTRO (Sprint 5 Atualizada) ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    
    // Log para você ver no terminal do VS Code/Railway se os dados chegaram
    console.log("Recebendo tentativa de cadastro para o login:", login);

    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    
    db.query(sql, [nome, login, senha], (err, result) => {
        if (err) {
            console.error('ERRO DETALHADO NO BANCO:', err);
            
            // Se o erro for de login duplicado (ER_DUP_ENTRY)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "Este login já existe!" });
            }
            
            // Se for qualquer outro erro (coluna errada, conexão, etc)
            return res.status(500).json({ error: "Erro ao salvar no banco: " + err.message });
        }
        
        console.log("✅ Usuário cadastrado com sucesso!");
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

// Garante que o index.html seja servido em qualquer outra rota
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`🚀 Servidor rodando na porta ${port}`));