const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

// LOGIN
app.post('/login', async (req, res) => {
    const { login, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, message: 'Incorreto' });
    } catch (error) { res.status(500).json({ error: 'Erro no login' }); }
});

// LISTAGEM ATUALIZADA (Trazendo mais campos para a tabela)
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome, telefone, nascimento FROM tbPessoas ORDER BY pessoa_id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

// CADASTRO COMPLETO (SPRINT 7 - Usando campos do seu diagrama)
app.post('/colaborador', async (req, res) => {
    const { nome, nascimento, telefone, pessoa_tipo_id } = req.body;
    try {
        // Geramos um CPF aleatório para não deixar o campo nulo, já que está no diagrama
        const cpfFake = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
        
        const sql = 'INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [nome, cpfFake, nascimento, telefone, pessoa_tipo_id]);
        
        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar no banco' });
    }
});

// EXCLUSÃO
app.delete('/colaborador/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tbPessoas WHERE pessoa_id = ?', [id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta ${port}`));