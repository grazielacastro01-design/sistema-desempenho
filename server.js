const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// CONFIGURAÇÃO DO BANCO DE DADOS
const db = mysql.createPool({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'railway',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- ROTA DE LOGIN DEFINITIVA ---
app.post('/login', (req, res) => {
    // Pegamos o que vem do site (usuario e senha)
    const { usuario, senha } = req.body; 
    
    // Comparamos com as colunas reais do seu banco (login e senha)
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    
    db.query(sql, [usuario, senha], (err, result) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).json(err);
        }
        
        if (result.length > 0) {
            // Se achou o 'teste' com a senha '123', ele loga!
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