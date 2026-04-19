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
    } catch (error) { res.status(500).json({ error: 'Erro no servidor' }); }
});

// LISTAR COLABORADORES (Pega da tbPessoas que agora tem dados!)
app.get('/colaboradores', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pessoa_id, nome FROM tbPessoas ORDER BY nome ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
});

// SALVAR AVALIAÇÃO (Ajustado para seu diagrama)
app.post('/avaliacao', async (req, res) => {
    const { funcionario_id, observacao } = req.body;
    
    try {
        const dataHoje = new Date().toISOString().split('T')[0]; // Formato DATE: YYYY-MM-DD
        const statusId = 1; // ID 1 = 'Pendente' que já existe
        
        // No seu diagrama, o campo 'atualizado_por' é obrigatório (INT)
        // Usaremos o ID 5 (seu ID na tbPessoas) como padrão por enquanto
        const usuarioAtualizador = 5; 

        const sql = `
            INSERT INTO tbAvaliacao 
            (data, observacao, funcionario_id, avaliacao_status_id, atualizado_por, atualizado_em) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        await db.execute(sql, [dataHoje, observacao, funcionario_id, statusId, usuarioAtualizador]);
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("ERRO DETALHADO NO BANCO:", error.message);
        res.status(500).json({ error: 'Erro técnico: ' + error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta ${port}`));