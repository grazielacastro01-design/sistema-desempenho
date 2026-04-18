const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONFIGURAÇÃO DO BANCO DE DADOS (CORRIGIDA PARA RAILWAY) ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST,     // O Railway preenche isso sozinho
    user: process.env.MYSQLUSER,     // O Railway preenche isso sozinho
    password: process.env.MYSQLPASSWORD, // O Railway preenche isso sozinho
    database: process.env.MYSQLDATABASE, // O Railway preenche isso sozinho
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- ROTA DE LOGIN DEFINITIVA COM LOGS DE DEPURAÇÃO ---
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body; 
    
    // Log para ver no painel do Railway o que o site está enviando
    console.log(`Tentativa de login - Usuário enviado: ${usuario}, Senha enviada: ${senha}`);

    // Comparamos com as colunas reais do seu banco (login e senha)
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    
    db.query(sql, [usuario, senha], (err, result) => {
        if (err) {
            console.error("Erro na consulta SQL:", err);
            return res.status(500).json(err);
        }
        
        // Log para conferir se o banco encontrou o usuário
        console.log("Resultado da busca no banco:", result);

        if (result.length > 0) {
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// Rota para buscar dados do perfil do colaborador
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM tbPessoas WHERE pessoa_id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// Rota de teste para verificar se o Railway está ativo
app.get('/', (req, res) => res.send('API SISTEMA DE DESEMPENHO ONLINE'));

// PORTA DINÂMICA PARA O RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));