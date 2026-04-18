const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Configure o CORS para aceitar qualquer origem durante os testes
app.use(cors());
app.use(bodyParser.json());

// ... restante do seu código de banco de dados e rotas ...

// Rota de Login
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    console.log(`Login recebido: ${login}`);
    const sql = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
    db.query(sql, [login, senha], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json({ message: "Login realizado!", user: result[0] });
        } else {
            res.status(401).json({ message: "Usuário ou senha incorretos" });
        }
    });
});

// Rota de Colaborador
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM tbPessoas WHERE pessoa_id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

module.exports = app; // Importante para a Vercel