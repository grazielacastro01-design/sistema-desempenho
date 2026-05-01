const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(cors());
app.use(express.json());

// Conexão com o Banco (Railway)
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// Rota para listar colaboradores (Alimenta o select do formulário)
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// Rota para salvar a avaliação (Referente ao erro da image_2100fb.png)
app.post('/avaliar', async (req, res) => {
    const { colaborador_id, feedback } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO tbAvaliacoes (colaborador_id, feedback, data_avaliacao) VALUES (?, ?, NOW())',
            [colaborador_id, feedback]
        );
        res.status(201).json({ message: 'Salvo com sucesso!', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar no banco' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});