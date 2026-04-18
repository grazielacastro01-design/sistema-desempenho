const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Configuração de CORS para permitir que a Vercel acesse o Railway
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexão com o banco de dados usando as variáveis de ambiente do Railway
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

// Teste de conexão nos logs do Railway
db.getConnection()
    .then(() => console.log("✅ Conexão com MySQL ativa!"))
    .catch(err => console.error("❌ Erro ao conectar no MySQL:", err));

// ROTA DE LOGIN
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
            res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ROTA DE LISTAGEM
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY pessoa_id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar lista' });
    }
});

// ROTA DE CADASTRO (CORRIGIDA PARA NÃO REPETIR CPF)
app.post('/colaborador', async (req, res) => {
    const { nome } = req.body;
    try {
        // Gera um número aleatório de 11 dígitos para o CPF não duplicar no banco
        const cpfFake = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
        
        const sql = 'INSERT INTO tbPessoas (nome, cpf, nascimento, pessoa_tipo_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [
            nome, 
            cpfFake,          // CPF aleatório para evitar Erro 500
            '2000-01-01',     // Data de nascimento padrão
            1                 // pessoa_tipo_id padrão
        ]);

        res.status(201).json({ id: result.insertId, message: 'Cadastrado com sucesso!' });
    } catch (error) {
        console.error("Erro detalhado no Banco:", error);
        res.status(500).json({ error: 'Erro ao salvar: o banco rejeitou os dados.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});