const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// --- ADICIONE O CORS AQUI ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- ADICIONE O BANCO AQUI (Usando process.env) ---
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

// Log para confirmar a conexão no Railway
db.getConnection()
    .then(() => console.log("✅ Banco conectado com sucesso!"))
    .catch(err => console.error("❌ Erro ao conectar no banco:", err));

// --- AS ROTAS CONTINUAM ABAIXO ---

app.post('/login', async (req, res) => {
    // ... seu código de login
});

app.get('/colaboradores', async (req, res) => {
    // ... seu código de listagem
});

app.post('/colaborador', async (req, res) => {
    // ... seu código de cadastro
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});