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

// --- CONFIGURAÇÃO DE CONEXÃO COM POOL (Mais estável para o Railway) ---
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

// Teste de conexão do Pool para garantir que o banco está online
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao Railway via Pool:', err.message);
    } else {
        console.log('✅ Banco de Dados Conectado via Pool com sucesso!');
        connection.release(); // Libera a conexão de teste de volta para o pool
    }
});

// --- ROTA DE CADASTRO (Sprint 5) ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, login, senha } = req.body;
    
    console.log("Recebendo tentativa de cadastro para o login:", login);

    const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
    
    // O pool gerencia a query automaticamente
    db.query(sql, [nome, login, senha], (err, result) => {
        if (err) {
            console.error('ERRO DETALHADO NO BANCO:', err);
            
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "Este login já existe!" });
            }
            
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
        
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso" });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// Serve o index.html para qualquer rota não encontrada
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`🚀 Servidor rodando na porta ${port}`));