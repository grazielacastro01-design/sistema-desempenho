const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Ativa o CORS para permitir que a Vercel acesse o Railway
app.use(cors());
app.use(express.json());

// Configuração da conexão com o banco de dados (Railway)
const db = mysql.createPool({
    host: process.env.MYSQLHOST || 'seu_host_aqui',
    user: process.env.MYSQLUSER || 'seu_usuario_aqui',
    password: process.env.MYSQLPASSWORD || 'sua_senha_aqui',
    database: process.env.MYSQLDATABASE || 'sua_base_aqui',
    port: process.env.MYSQLPORT || 3306
});

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?',
            [login, senha]
        );

        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// --- ROTA DE LISTAGEM (O que faz a tabela aparecer) ---
app.get('/colaboradores', async (req, res) => {
    try {
        // Buscando da tabela tbPessoas que vimos no seu banco
        const [rows] = await db.execute('SELECT pessoa_id, nome, cargo FROM tbPessoas');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// --- ROTA DE CADASTRO (CRUD) ---
app.post('/colaborador', async (req, res) => {
    const { nome, cargo } = req.body;
    try {
        // pessoa_tipo_id = 5 (padrão que você usa para colaborador)
        const sql = 'INSERT INTO tbPessoas (nome, cargo, pessoa_tipo_id) VALUES (?, ?, 5)';
        const [result] = await db.execute(sql, [nome, cargo]);
        res.status(201).json({ id: result.insertId, message: 'Cadastrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar no banco' });
    }
});

// Iniciar o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});