const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONFIGURAÇÃO DO BANCO DE DADOS (RAILWAY) ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST || 'shuttle.proxy.rlwy.net',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'HMhYiBGRRSVOFiROAVJdwKynxQakxiiQ',
    database: process.env.MYSQLDATABASE || 'railway',
    port: process.env.MYSQLPORT || 30041,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Rota de Login
app.post('/login', (req, res) => {
    const { login, senha } = req.body; 
    console.log(`Tentativa de login: ${login}`);

    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    db.query(sql, [login, senha], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro no banco", error: err });

        if (result.length > 0) {
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// Rota de Perfil
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM tbPessoas WHERE pessoa_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});

app.get('/', (req, res) => res.send('API SISTEMA DE DESEMPENHO ONLINE'));

// Necessário para rodar localmente
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

// ESSENCIAL PARA VERCEL FUNCIONAR
module.exports = app;