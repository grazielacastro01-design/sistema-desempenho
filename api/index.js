const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Configuração de CORS para permitir que a Vercel acesse o Railway
app.use(cors());
app.use(express.json());

// Conexão com o Banco de Dados do Railway
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// --- ROTA DE LOGIN (ESTAVA FALTANDO!) ---
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        // Busca na tabela tbUsuarios conforme o seu diagrama
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        
        if (rows.length > 0) {
            // Se achou o usuário, retorna os dados dele
            res.json({ success: true, user: rows[0] });
        } else {
            // Se não achou, retorna erro de credenciais
            res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
        }
    } catch (error) {
        console.error("Erro no Banco:", error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// --- LISTAR COLABORADORES ---
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) { 
        res.status(500).json({ error: 'Erro ao listar colaboradores' }); 
    }
});

// --- SALVAR AVALIAÇÃO ---
app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        const statusPendente = 1; // Certifique-se que o ID 1 existe na tbAvaliacaoStatus

        const sql = 'INSERT INTO tbAvaliacao (data, observacao, funcionario_id, avaliacao_status_id) VALUES (?, ?, ?, ?)';
        await db.execute(sql, [dataHoje, observacao, funcionario_id, statusPendente]);
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        res.status(500).json({ error: 'Erro ao salvar avaliação' });
    }
});

// Porta do servidor
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${port}`));