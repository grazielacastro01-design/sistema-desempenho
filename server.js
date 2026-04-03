const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Importante para aceitar chamadas da Vercel
const app = express();

app.use(express.json());
app.use(cors()); // Libera o acesso para o seu front-end na Vercel

// Configuração do Banco de Dados (Use suas variáveis do Railway)
const db = mysql.createConnection(process.env.MYSQL_URL || 'sua_string_de_conexao_aqui');

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao Banco de Dados do Railway!');
});

// Rota de Cadastro
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, email, senha } = req.body;
    const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';

    db.query(query, [nome, email, senha], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao salvar no banco.' });
        }
        res.status(201).json({ message: 'Usuário cadastrado!' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));