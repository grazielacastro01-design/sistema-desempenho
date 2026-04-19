const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
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
        else res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    } catch (error) { res.status(500).json({ error: 'Erro no login' }); }
});

// LISTAR COLABORADORES
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

// SALVAR AVALIAÇÃO (AJUSTADO PARA O DIAGRAMA)
app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    
    // Log para você ver no terminal do Railway o que está chegando
    console.log("Recebendo avaliação para ID:", funcionario_id);

    try {
        const dataHoje = new Date().toISOString().split('T')[0];
        const statusId = 1; // Corresponde ao 'Pendente' que inserimos no Passo 1

        // Usando os campos exatos da sua imagem do MySQL Workbench
        const sql = 'INSERT INTO tbAvaliacao (data, observacao, funcionario_id, avaliacao_status_id) VALUES (?, ?, ?, ?)';
        
        await db.execute(sql, [dataHoje, observacao, funcionario_id, statusId]);
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message);
        res.status(500).json({ error: 'Erro interno ao salvar no banco: ' + error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Servidor ON na porta ${port}`));