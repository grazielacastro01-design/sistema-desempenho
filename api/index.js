const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// --- CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- CONEXÃO COM O BANCO (Railway) ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão nos logs
db.getConnection()
    .then(() => console.log("✅ Conectado ao MySQL com sucesso!"))
    .catch(err => console.error("❌ Erro de conexão:", err));

// --- ROTA: LOGIN ---
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

// --- ROTA: LISTAR COLABORADORES ---
app.get('/colaboradores', async (req, res) => {
    try {
        // Buscando apenas o que existe na sua tbPessoas
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY pessoa_id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar' });
    }
});

// --- ROTA: CADASTRAR COLABORADOR ---
app.post('/colaborador', async (req, res) => {
    const { nome } = req.body;
    try {
        // Inserindo dados obrigatórios para evitar Erro 500 (CPF e Nascimento)
        const sql = 'INSERT INTO tbPessoas (nome, cpf, nascimento, pessoa_tipo_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [
            nome, 
            '000.000.000-00', // CPF padrão
            '2000-01-01',     // Data padrão
            1                 // pessoa_tipo_id conforme seu banco
        ]);
        res.status(201).json({ id: result.insertId, message: 'Sucesso!' });
    } catch (error) {
        console.error("Erro no Banco:", error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});