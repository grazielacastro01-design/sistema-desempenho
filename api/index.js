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

// 1. Rota para listar colaboradores (Popula o select no formulário)
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar colaboradores:", err);
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// 2. Rota para salvar a avaliação (Ajustada para os nomes da image_20811d.png)
app.post('/avaliar', async (req, res) => {
    const { colaborador_id, feedback } = req.body;
    try {
        // Usando 'funcionario_id' e 'observacao' para bater exatamente com sua tabela tbAvaliacao
        const [result] = await db.execute(
            'INSERT INTO tbAvaliacao (funcionario_id, observacao, data) VALUES (?, ?, NOW())',
            [colaborador_id, feedback]
        );
        res.status(201).json({ message: 'Salvo com sucesso!', id: result.insertId });
    } catch (err) {
        console.error("Erro detalhado ao salvar:", err);
        res.status(500).json({ error: 'Erro ao salvar no banco. Verifique os nomes das colunas.' });
    }
});

// 3. Rota de Login (Corrigida com a coluna 'login' conforme image_1f9cbb.png)
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body; 
    try {
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

// 4. Rota para listar usuários (Para preencher a tabela na image_1f90ff.png)
app.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT usuario_id, nome, login FROM tbUsuarios');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).json({ error: 'Erro ao carregar a lista de usuários' });
    }
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});