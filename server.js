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

// Rota para buscar dados do colaborador
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

// Rota para buscar feedbacks
app.get('/feedbacks/:id', (req, res) => {
    const id = req.params.id;
    // Ajuste os nomes das colunas conforme sua tabela real
    const sql = 'SELECT idAvaliacacao, comentario, nota FROM tbAvaliacao WHERE idPessoa = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Rota para registrar avaliação
app.post('/registrar-avaliacao', (req, res) => {
    const { nota, comentario, idPessoa, idStatus } = req.body;
    const sql = 'INSERT INTO tbAvaliacao (nota, comentario, idPessoa, idStatus) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [nota, comentario, idPessoa, idStatus], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Sucesso", id: result.insertId });
    });
});

// Rota de teste para ver se o servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor da Grazi está online no Railway!');
});

// PORTA DINÂMICA (Obrigatório para o Railway não dar Crash)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});