const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configurações para o servidor entender JSON e formulários
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir os arquivos estáticos (HTML, CSS) para o navegador
app.use(express.static(path.join(__dirname, '/')));

// --- CONEXÃO REAL COM O BANCO DE DADOS (RAILWAY) ---
const db = mysql.createConnection({
    host: 'autorack.proxy.rlwy.net',
    user: 'root',
    password: 'EdiCrrOOgyNiSQtDJYSXaHKWetNCFiiO',
    database: 'railway',
    port: 42256
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL do Railway:', err);
        return;
    }
    console.log('✅ Conectado ao Banco de Dados do Railway com sucesso!');
});

// --- ROTAS DO SISTEMA ---

// 1. Rota de Login (Consultando a sua tbUsuarios)
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    
    db.query(sql, [login, senha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            res.status(401).json({ message: "Login ou senha incorretos" });
        }
    });
});

// Rota para abrir a Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});