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

// Rota para listar colaboradores
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// Rota para salvar a avaliação - CORRIGIDA para o nome singular
app.post('/avaliar', async (req, res) => {
    const { colaborador_id, feedback } = req.body;
    try {
        // Ajustado para tbAvaliacao (singular) conforme sua imagem do Railway
        const [result] = await db.execute(
            'INSERT INTO tbAvaliacao (colaborador_id, feedback, data_avaliacao) VALUES (?, ?, NOW())',
            [colaborador_id, feedback]
        );
        res.status(201).json({ message: 'Salvo com sucesso!', id: result.insertId });
    } catch (err) {
        console.error("Erro no Banco:", err);
        res.status(500).json({ error: 'Erro ao salvar no banco. Verifique se a tabela tbAvaliacao existe.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});