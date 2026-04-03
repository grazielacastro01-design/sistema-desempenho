const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();

// Configurações essenciais
app.use(cors());
app.use(express.json());
// Serve os arquivos HTML (index, cadastrar, login, etc) automaticamente
app.use(express.static(path.join(__dirname)));

// --- CONEXÃO COM O BANCO ---
const db = mysql.createConnection(process.env.MYSQL_URL || {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    connectTimeout: 10000 
});

db.connect((err) => {
    if (err) {
        console.error('❌ ERRO CRÍTICO NO BANCO:', err.message);
        return;
    }
    console.log('✅ SUCESSO: Conectado ao MySQL do Railway!');
});

// --- ROTA: CADASTRAR PESSOA (SINE) ---
app.post('/cadastrar', (req, res) => {
    const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;
    const sql = "INSERT INTO tbPessoa (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, cpf, nascimento, telefone, pessoa_tipo_id], (err, result) => {
        if (err) {
            console.error('Erro ao inserir pessoa:', err);
            return res.status(500).send("Erro ao salvar no banco");
        }
        res.status(200).send("Cadastrado com sucesso!");
    });
});

// --- ROTA: CADASTRAR NOVO USUÁRIO (SISTEMA) ---
// Esta é a rota que fará o botão "Finalizar Cadastro" funcionar
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, email, senha } = req.body;
    const sql = "INSERT INTO tbUsuarios (nome, email, senha) VALUES (?, ?, ?)";
    
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.error('Erro ao inserir usuário:', err);
            return res.status(500).send("Erro ao cadastrar usuário");
        }
        res.status(200).send("Usuário cadastrado com sucesso!");
    });
});

// Rota para Listar (Relatórios)
app.get('/api/pessoas', (req, res) => {
    const sql = "SELECT * FROM tbPessoa";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar:', err);
            return res.status(500).send("Erro ao buscar dados");
        }
        res.json(results);
    });
});

// Rota principal para abrir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});