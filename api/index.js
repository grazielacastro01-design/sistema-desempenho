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

// 2. Rota para salvar a avaliação (Ajustada para os campos obrigatórios do seu banco)
app.post('/avaliar', async (req, res) => {
    const { colaborador_id, feedback } = req.body;
    try {
        // Incluímos 'avaliacao_status_id' e 'atualizado_por' com valores padrão (1 e 5) 
        // baseados no que já existe na sua tabela para evitar o Erro 500.
        const [result] = await db.execute(
            'INSERT INTO tbAvaliacao (funcionario_id, observacao, data, avaliacao_status_id, atualizado_por) VALUES (?, ?, NOW(), 1, 5)',
            [colaborador_id, feedback]
        );
        res.status(201).json({ message: 'Salvo com sucesso!', id: result.insertId });
    } catch (err) {
        console.error("ERRO DETALHADO NO BANCO:", err.message);
        res.status(500).json({ error: 'Erro ao salvar. Verifique se os campos obrigatórios estão preenchidos.' });
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

// 5. Rota para listar o histórico de avaliações (Para a tela avaliacoes.html)
app.get('/avaliacoes', async (req, res) => {
    try {
        // Fazemos um JOIN com tbPessoas para pegar o nome do colaborador em vez de apenas o ID
        const [rows] = await db.execute(`
            SELECT 
                DATE_FORMAT(a.data, '%d/%m/%Y') AS data, 
                p.nome AS colaborador, 
                a.observacao 
            FROM tbAvaliacao a
            JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id
            ORDER BY a.data DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao listar avaliações:", err);
        res.status(500).json({ error: 'Erro ao carregar o histórico' });
    }
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});