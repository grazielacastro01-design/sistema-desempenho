const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Ajuste para funcionar na Vercel e Local

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// --- CONEXÃO CONFIGURADA PARA O BANCO OFICIAL NO RAILWAY ---
const db = mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041 
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no Railway:', err.message);
        return;
    }
    console.log('✅ CONECTADO AO BANCO OFICIAL NA NUVEM!');
});

// --- ROTA DE LOGIN (4ª Sprint) ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    
    db.query(sql, [login, senha], (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            res.status(401).json({ message: "Login ou senha incorretos" });
        }
    });
});

// --- ROTA DE CADASTRO DE USUÁRIO (5ª Sprint - NOVA!) ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;

    if (!nome || !login || !senha) {
        return res.status(400).json({ error: "Preencha todos os campos!" });
    }

    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    
    db.query(sql, [nome, login, senha], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar:', err);
            return res.status(500).json({ error: "Erro ao cadastrar usuário no banco." });
        }
        res.status(201).json({ message: "Usuário cadastrado com sucesso!", id: result.insertId });
    });
});

// Rota para carregar sua página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});