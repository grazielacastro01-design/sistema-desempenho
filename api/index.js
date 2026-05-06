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
        const [rows] = await db.execute('SELECT p.pessoa_id, p.nome FROM tbPessoas p');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar colaboradores:", err);
        res.status(500).json({ error: 'Erro ao buscar colaboradores' });
    }
});

// 2. Rota para salvar a avaliação (Ajustada para os campos obrigatórios da tbAvaliacao)
app.post('/avaliar', async (req, res) => {
    const { colaborador_id, feedback } = req.body;
    try {
        // Incluímos 'avaliacao_status_id' e 'atualizado_por' com valores padrão (1 e 5) 
        // para evitar erros de campo obrigatório no banco.
        const [result] = await db.execute(
            'INSERT INTO tbAvaliacao (funcionario_id, observacao, data, avaliacao_status_id, atualizado_por) VALUES (?, ?, NOW(), 1, 5)',
            [colaborador_id, feedback]
        );
        res.status(201).json({ message: 'Salvo com sucesso!', id: result.insertId });
    } catch (err) {
        console.error("Erro detalhado ao salvar:", err.message);
        res.status(500).json({ error: 'Erro ao salvar no banco.' });
    }
});

// 3. Rota de Login (Atualizada para retornar o perfil do usuário)
app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body; 
    try {
        const [rows] = await db.execute(
            'SELECT usuario_id, nome, login, perfil FROM tbUsuarios WHERE login = ? AND senha = ?', 
            [usuario, senha]
        );

        if (rows.length > 0) {
            // Agora envia o ID, Nome, Login E o Perfil (Admin/Gestor) para o navegador
            res.json(rows[0]);
        } else {
            res.status(401).json({ message: 'Usuário ou senha incorretos' });
        }
    } catch (err) {
        console.error("Erro no Login:", err);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

// 4. Rota para listar usuários (Atualizada para incluir o campo 'perfil')
app.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT usuario_id, nome, login, perfil FROM tbUsuarios');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).json({ error: 'Erro ao carregar a lista de usuários' });
    }
});

// 4.1 ROTA PARA CADASTRAR NOVO USUÁRIO (POST)
app.post('/usuarios', async (req, res) => {
    const { nome, login, senha } = req.body;
    try {
        // Define 'Gestor' automaticamente para novos cadastros
        const query = 'INSERT INTO tbUsuarios (nome, login, senha, perfil) VALUES (?, ?, ?, "Gestor")';
        await db.execute(query, [nome, login, senha]);
        
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
        console.error("Erro ao cadastrar usuário:", err);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

// 4.2 ROTA PARA ATUALIZAR UM USUÁRIO EXISTENTE (PUT)
app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, login, senha } = req.body;
    try {
        let query;
        let params;

        // Se o usuário digitou uma senha nova, atualiza ela. Se deixou em branco, mantém a antiga.
        if (senha && senha.trim() !== "") {
            query = 'UPDATE tbUsuarios SET nome = ?, login = ?, senha = ? WHERE usuario_id = ?';
            params = [nome, login, senha, id];
        } else {
            query = 'UPDATE tbUsuarios SET nome = ?, login = ? WHERE usuario_id = ?';
            params = [nome, login, id];
        }

        await db.execute(query, params);
        res.json({ message: 'Usuário atualizado com sucesso!' });
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

// 5. Rota para carregar o histórico (Tela avaliacoes.html)
app.get('/avaliacoes', async (req, res) => {
    try {
        // Buscamos os dados e usamos um JOIN para trazer o nome do colaborador da tbPessoas
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