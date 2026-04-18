const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONEXÃO DIRETA (SEM DEPENDER DE VARIÁVEIS DA VERCEL) ---
const db = mysql.createPool({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYiBGRRSVOFiROAVJdwKynxQakxiiQ', 
    database: 'railway',
    port: 30041,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 // 20 segundos para evitar timeout
});

// Teste de conexão ao iniciar
db.getConnection((err, connection) => {
    if (err) {
        console.error("ERRO CRÍTICO NO BANCO:", err.message);
    } else {
        console.log("CONECTADO AO RAILWAY COM SUCESSO!");
        connection.release();
    }
});

app.post('/login', (req, res) => {
    const { login, senha } = req.body;
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

app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM tbPessoas WHERE pessoa_id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

app.get('/', (req, res) => res.send('API FUNCIONANDO'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

module.exports = app;