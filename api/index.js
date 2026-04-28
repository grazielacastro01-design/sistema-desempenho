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

// --- SPRINT 6: CRUD DE USUÁRIOS ---

// 1. ROTA PARA LISTAR (Usada pelo usuarios.html)
app.get('/usuarios', async (req, res) => {
    try {
        const [results] = await db.execute("SELECT usuario_id, nome, login FROM tbUsuarios");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ROTA PARA INCLUIR (Usada pelo usuarios-cadastro.html)
app.post('/usuarios', async (req, res) => {
    const { nome, login, senha } = req.body;
    try {
        const sql = "INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)";
        const [result] = await db.execute(sql, [nome, login, senha]);
        res.status(201).json({ message: "Usuário cadastrado!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ROTA PARA BUSCAR UM USUÁRIO (Necessária para a função de EDITAR)
app.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute("SELECT * FROM tbUsuarios WHERE usuario_id = ?", [id]);
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. ROTA PARA EXCLUIR (Usada pelo botão excluir no usuarios.html)
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("DELETE FROM tbUsuarios WHERE usuario_id = ?", [id]);
        res.json({ message: "Usuário removido com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

// As demais rotas continuam aqui abaixo...

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta ${port}`));