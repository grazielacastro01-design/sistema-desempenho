const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname, '/')));

// --- CONFIGURAÇÃO DE CONEXÃO COM POOL ---
const db = mysql.createPool({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao Railway via Pool:', err.message);
    } else {
        console.log('✅ Banco de Dados Conectado via Pool com sucesso!');
        connection.release();
    }
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const login = req.body.login ? req.body.login.trim() : "";
    const senha = req.body.senha ? req.body.senha.trim() : "";

    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    db.query(sql, [login, senha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso" });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// --- ROTA DE CADASTRO DE USUÁRIOS ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    db.query(sql, [nome, login, senha], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "Este login já existe!" });
            return res.status(500).json({ error: "Erro ao salvar no banco" });
        }
        res.status(201).json({ message: "Sucesso" });
    });
});

// ✅ ROTA DE COLABORADORES
app.get('/api/colaboradores', (req, res) => {
    const sql = "SELECT * FROM tbPessoas ORDER BY nome ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// --- REDIRECIONAMENTO FINAL ---
// Se o usuário acessar a raiz "/" ou qualquer rota inexistente, manda para o login.html
// Isso evita o erro 404 na Vercel
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(port, () => console.log(`🚀 Servidor rodando na porta ${port}`));