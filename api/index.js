const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// --- CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
// Isso resolve o erro de "Access-Control-Allow-Origin" que apareceu no console
app.use(cors({
    origin: '*', // Permite que a Vercel acesse o Railway
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// --- CONEXÃO COM O BANCO DE DADOS (RAILWAY) ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 30041,
    ssl: { rejectUnauthorized: false }, // Necessário para conexões externas
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 
});

// Teste de conexão automático
db.getConnection((err, connection) => {
    if (err) {
        console.error("ERRO CRÍTICO NO BANCO:", err.message);
    } else {
        console.log("CONECTADO AO RAILWAY COM SUCESSO!");
        connection.release();
    }
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    // Usando tbUsuarios conforme seu banco
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    
    db.query(sql, [login, senha], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// --- ROTA DO DASHBOARD ---
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    // AJUSTADO: Usando o nome correto da tabela 'tbPessoas' que vimos na imagem
    const query = 'SELECT * FROM tbPessoas WHERE pessoa_id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erro no Banco:", err);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Colaborador não encontrado' });
        }
        res.json(result[0]);
    });
});

// Rota de teste para ver no navegador
app.get('/', (req, res) => res.send('API SD PERFORMANCE RODANDO!'));

// Exportação para a Vercel/Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

module.exports = app;