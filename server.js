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

// --- ROTA DE CADASTRO DE USUÁRIO (Login do Sistema) ---
app.post('/cadastrar-usuario', (req, res) => {
    const { nome, email, senha } = req.body;
    const query = 'INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)';

    db.query(query, [nome, email, senha], (err, result) => {
        if (err) {
            console.error('ERRO NO CADASTRO:', err);
            return res.status(500).json({ message: 'Erro ao salvar no banco.' });
        }
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';

    db.query(query, [email, senha], (err, results) => {
        if (err) {
            console.error('ERRO NO LOGIN:', err);
            return res.status(500).json({ message: 'Erro interno no servidor.' });
        }

        if (results.length > 0) {
            res.status(200).json({ message: 'Login realizado!', user: results[0] });
        } else {
            res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        }
    });
});

// --- ROTA PARA LISTAR COLABORADORES (Puxa da tbPessoas) ---
app.get('/colaboradores', (req, res) => {
    const query = 'SELECT * FROM tbPessoas';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar colaboradores:', err);
            return res.status(500).json({ message: 'Erro ao buscar dados.' });
        }
        res.status(200).json(results);
    });
});

// --- ROTA PARA CADASTRAR NOVO COLABORADOR (Insere na tbPessoas) ---
app.post('/colaboradores', (req, res) => {
    const { nome, cpf, nascimento } = req.body;
    const query = 'INSERT INTO tbPessoas (nome, cpf, nascimento) VALUES (?, ?, ?)';

    db.query(query, [nome, cpf, nascimento], (err, result) => {
        if (err) {
            console.error('Erro ao inserir colaborador:', err);
            return res.status(500).json({ message: 'Erro ao salvar colaborador.' });
        }
        res.status(201).json({ message: 'Colaborador cadastrado com sucesso!' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));