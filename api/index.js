const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(cors());
app.use(express.json());

// Conexão com o Banco (Railway) utilizando variáveis de ambiente
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// --- ROTAS DO SISTEMA ---

// 1. Rota para listar colaboradores
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar colaboradores:", err);
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// 2. Rota para salvar a avaliação (Tabela: tbAvaliacao)
app.post('/avaliar', async (req, res) => {
    const { colaborador_id, feedback } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO tbAvaliacao (colaborador_id, feedback, data_avaliacao) VALUES (?, ?, NOW())',
            [colaborador_id, feedback]
        );
        res.status(201).json({ message: 'Salvo com sucesso!', id: result.insertId });
    } catch (err) {
        console.error("Erro ao salvar avaliação:", err);
        res.status(500).json({ error: 'Erro ao salvar no banco. Verifique se a tabela tbAvaliacao existe.' });
    }
});

// 3. Rota de Login (Corrigida com a coluna 'login' conforme image_1f9cbb.png)
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body; // 'usuario' vem do seu formulário HTML
    try {
        // Mudamos de 'usuario = ?' para 'login = ?' para bater com o seu banco
        const [rows] = await db.execute(
            'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?', 
            [usuario, senha]
        );

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(401).json({ message: 'Usuário ou senha incorretos' });
        }
    } catch (err) {
        console.error("Erro no Login:", err);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});