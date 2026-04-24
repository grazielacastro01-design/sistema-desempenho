const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
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

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    } catch (error) { res.status(500).json({ error: 'Erro no servidor' }); }
});

// --- NOVA ROTA: CADASTRO DE USUÁRIO ---
app.post('/cadastrar-usuario', async (req, res) => {
    const { nome, login, senha } = req.body;
    try {
        const sql = `INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)`;
        await db.execute(sql, [nome, login, senha]);
        res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ error: 'Erro ao salvar usuário no banco de dados' });
    }
});

// --- ROTA DO DASHBOARD ---
app.get('/dashboard-resumo', async (req, res) => {
    try {
        const [totalAvaliacoes] = await db.execute('SELECT COUNT(*) as total FROM tbAvaliacao');
        const [totalPessoas] = await db.execute('SELECT COUNT(*) as total FROM tbPessoas');
        const [totalMetas] = await db.execute('SELECT COUNT(*) as total FROM tbMetas'); 
        
        res.json({ 
            avaliacoes: totalAvaliacoes[0].total, 
            colaboradores: totalPessoas[0].total,
            metas: totalMetas[0].total 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar resumo' });
    }
});

// --- LISTAR COLABORADORES ---
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar colaboradores' }); }
});

// As demais rotas (Avaliação, Metas, PDI) continuam iguais abaixo...
// [O restante do seu código permanece o mesmo]

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta ${port}`));