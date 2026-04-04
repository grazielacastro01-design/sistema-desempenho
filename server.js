const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// --- CONEXÃO COM RAILWAY ---
const db = mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041 
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no Railway:', err.message);
        return;
    }
    console.log('✅ CONECTADO AO BANCO NO RAILWAY!');
});

// --- ROTA DE LOGIN (Sprint 4) ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    db.query(sql, [login, senha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            res.status(401).json({ message: "Incorreto" });
        }
    });
});

// --- ROTA DE CADASTRO DE PESSOAS (Sprint 5) ---
app.post('/cadastrar-funcionario', (req, res) => {
    const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;

    const sql = "INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, cpf, nascimento, telefone, pessoa_tipo_id], (err, result) => {
        if (err) {
            console.error('Erro ao inserir:', err);
            return res.status(500).send("Erro ao salvar no banco: " + err.message);
        }
        res.status(201).send("Sucesso");
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});