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

// --- ROTA PARA DELETAR META ---
app.delete('/deletar-meta/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tbMetas WHERE meta_id = ?', [id]);
        res.json({ success: true, message: "Meta apagada com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar:", error);
        res.status(500).json({ error: "Erro ao deletar meta" });
    }
});

// --- LISTAR COLABORADORES ---
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar colaboradores' }); }
});

// --- SALVAR AVALIAÇÃO ---
app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        const sql = `INSERT INTO tbAvaliacao (data, observacao, funcionario_id, avaliacao_status_id, atualizado_por, atualizado_em) VALUES (?, ?, ?, 1, 5, NOW())`;
        await db.execute(sql, [dataHoje, observacao, funcionario_id]);
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao salvar' }); }
});

// --- LISTAR HISTÓRICO DE AVALIAÇÕES ---
app.get('/listar-avaliacoes', async (req, res) => {
    try {
        const sql = `SELECT a.avaliacao_id, a.data, a.observacao, p.nome as nome_colaborador FROM tbAvaliacao a JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id ORDER BY a.data DESC`;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar histórico' }); }
});

// --- SALVAR META ---
app.post('/metas', async (req, res) => {
    const { pessoa_id, titulo, descricao, prazo } = req.body;
    try {
        const sql = `INSERT INTO tbMetas (pessoa_id, titulo, descricao, prazo) VALUES (?, ?, ?, ?)`;
        await db.execute(sql, [pessoa_id, titulo, descricao, prazo]);
        res.status(201).json({ success: true, message: 'Meta salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao inserir meta:', error);
        res.status(500).json({ error: 'Erro ao salvar meta no banco de dados' });
    }
});

// --- LISTAR METAS ---
app.get('/listar-metas', async (req, res) => {
    try {
        const sql = `SELECT m.*, p.nome as nome_colaborador FROM tbMetas m JOIN tbPessoas p ON m.pessoa_id = p.pessoa_id ORDER BY m.prazo ASC`;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar metas' }); }
});

// --- SALVAR PDI (NOVA ROTA) ---
app.post('/pdi', async (req, res) => {
    const { pessoa_id, objetivo, descricao, prazo } = req.body;
    try {
        const sql = `INSERT INTO tbPDI (pessoa_id, objetivo, descricao, prazo) VALUES (?, ?, ?, ?)`;
        await db.execute(sql, [pessoa_id, objetivo, descricao, prazo]);
        res.status(201).json({ success: true, message: 'PDI salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar PDI:', error);
        res.status(500).json({ error: 'Erro ao salvar PDI' });
    }
});

// --- LISTAR PDIs (NOVA ROTA) ---
app.get('/listar-pdi', async (req, res) => {
    try {
        const sql = `SELECT pdi.*, p.nome as nome_colaborador FROM tbPDI pdi JOIN tbPessoas p ON pdi.pessoa_id = p.pessoa_id ORDER BY pdi.prazo ASC`;
        const [rows] = await db.execute(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar PDIs' });
    }
});

// --- EDITAR AVALIAÇÃO ---
app.put('/avaliacao/:id', async (req, res) => {
    const { id } = req.params;
    const { observacao } = req.body;
    try {
        await db.execute('UPDATE tbAvaliacao SET observacao = ?, atualizado_em = NOW() WHERE avaliacao_id = ?', [observacao, id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao editar' }); }
});

// --- EXCLUIR AVALIAÇÃO ---
app.delete('/avaliacao/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tbAvaliacao WHERE avaliacao_id = ?', [id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta ${port}`));