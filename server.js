const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const app = express();

app.use(express.json());
app.use(cors()); 

// Conexão com o seu MySQL do Railway
const db = mysql.createConnection(process.env.MYSQL_URL || 'mysql://root:EdiCrrOOgYNiSQtDJYSXaHKwEtNCFiiO@autorack.proxy.rlwy.net:42256/railway');

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao Banco de Dados do Railway!');
});

// Rota de Cadastro corrigida para as suas colunas: nome, login, senha
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, email, senha } = req.body;

    // AJUSTE AQUI: Mudei 'email' para 'login' para bater com o seu print
    const query = 'INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)';

    db.query(query, [nome, email, senha], (err, result) => {
        if (err) {
            console.error('ERRO NO BANCO:', err);
            return res.status(500).json({ message: 'Erro ao salvar no banco.', detalhe: err.message });
        }
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));