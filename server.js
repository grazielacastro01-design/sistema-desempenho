const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Permite que a Vercel acesse o servidor do Railway

// Configuração da Conexão com o Banco de Dados
const db = mysql.createConnection(process.env.MYSQL_URL || 'mysql://root:EdiCrrOOgYNiSQtDJYSXaHKwEtNCFiiO@autorack.proxy.rlwy.net:42256/railway');

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao Banco de Dados do Railway!');
});

// Rota de Cadastro de Usuário
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, email, senha } = req.body;

    // IMPORTANTE: Usei 'tbUsuarios' porque é o nome que está no seu Railway
    const query = 'INSERT INTO tbUsuarios (nome, email, senha) VALUES (?, ?, ?)';

    db.query(query, [nome, email, senha], (err, result) => {
        if (err) {
            console.error('Erro ao inserir no banco:', err);
            // Retorna o erro detalhado para o console para te ajudar a debugar
            return res.status(500).json({ message: 'Erro ao salvar no banco.', error: err.message });
        }
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));