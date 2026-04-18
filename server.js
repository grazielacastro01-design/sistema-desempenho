const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONFIGURAÇÃO DO BANCO DE DADOS (RAILWAY) ---
// Adicionamos os valores diretos após o || para garantir a conexão
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

// --- ROTA DE LOGIN CORRIGIDA ---
app.post('/login', (req, res) => {
    // Recebendo 'login' e 'senha' do frontend
    const { login, senha } = req.body; 
    
    // Log para depuração na Vercel
    console.log(`Tentativa de login - Usuário enviado: ${login}, Senha enviada: ${senha}`);

    // Consulta SQL usando a coluna 'login' da sua tbUsuarios
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    
    db.query(sql, [login, senha], (err, result) => {
        if (err) {
            console.error("Erro na consulta SQL:", err);
            return res.status(500).json(err);
        }
        
        console.log("Resultado da busca no banco:", result);

        if (result.length > 0) {
            // Login com sucesso
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            // Usuário ou senha não encontrados
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// Rota para buscar dados do perfil do colaborador
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM tbPessoas WHERE pessoa_id = ?', [id], (err, result) => {
        if (err) {
            console.error("Erro ao buscar colaborador:", err);
            return res.status(500).send(err);
        }
        res.json(result[0]);
    });
});

app.get('/', (req, res) => res.send('API SISTEMA DE DESEMPENHO ONLINE'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// --- ESSENCIAL PARA FUNCIONAR NA VERCEL ---
module.exports = app;