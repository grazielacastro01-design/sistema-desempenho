const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// CONFIGURAÇÃO DO BANCO DE DADOS (Usando Variáveis de Ambiente do Railway)
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

// Rota para o seu site buscar os dados do perfil (HTML chama essa rota)
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT pessoa_id, nome FROM tbPessoas WHERE pessoa_id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: "Colaborador não encontrado" });
        }
    });
});

// Rota para buscar os feedbacks (usada na aba de feedbacks)
app.get('/feedbacks/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT idAvaliacacao, comentario, nota FROM tbAvaliacao WHERE idPessoa = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Rota para salvar um novo feedback no MySQL
app.post('/registrar-avaliacao', (req, res) => {
    const { nota, comentario, idPessoa, idStatus } = req.body;
    const sql = 'INSERT INTO tbAvaliacao (nota, comentario, idPessoa, idStatus) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [nota, comentario, idPessoa, idStatus], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Sucesso", id: result.insertId });
    });
});

// Rota de teste (Abra o link do Railway no navegador para ver isso)
app.get('/', (req, res) => {
    res.send('API do Sistema de Desempenho está ONLINE!');
});

// PORTA DINÂMICA (Obrigatório para o Railway funcionar)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});