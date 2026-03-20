const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();

// Configurações essenciais
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuração para o Banco de Dados do Railway
// Usando 'mysql://' ajuda o Node a entender que é um banco externo
const db = mysql.createConnection({
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
    // Isso vai nos mostrar nos logs se o erro mudou de 127.0.0.1 para outra coisa
    return;
  }
  console.log('✅ SUCESSO: Conectado ao MySQL do Railway!');
});

// Rota para Cadastrar
app.post('/cadastrar', (req, res) => {
    const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;
    const sql = "INSERT INTO tbPessoa (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, cpf, nascimento, telefone, pessoa_tipo_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erro ao salvar no banco");
        }
        res.status(200).send("Cadastrado com sucesso!");
    });
});

// Rota para Listar (Relatórios)
app.get('/api/pessoas', (req, res) => {
    const sql = "SELECT * FROM tbPessoa";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erro ao buscar dados");
        }
        res.json(results);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});