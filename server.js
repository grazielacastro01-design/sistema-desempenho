const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o seu banco MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',     
    database: 'seu_banco_de_dados' // <--- COLOQUE O NOME DO SEU BANCO AQUI
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL!');
});

// ROTA 1: Buscar dados do colaborador (tbPessoas)
// Ajustado para 'pessoa_id' conforme sua imagem do MySQL
app.get('/colaborador/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM tbPessoas WHERE pessoa_id = ?"; 
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result[0]);
    });
});

// ROTA 2: Salvar Feedback/Avaliação (tbAvaliacacao)
app.post('/registrar-avaliacao', (req, res) => {
    const { nota, comentario, idPessoa, idStatus } = req.body;
    
    // Ajuste as colunas se necessário, mas mantendo a lógica do seu diagrama
    const sql = "INSERT INTO tbAvaliacacao (nota, comentario, pessoa_id, idAvaliacaoStatus) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nota, comentario, idPessoa, idStatus], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Avaliação salva com sucesso!", id: result.insertId });
    });
});

// ROTA 3: Buscar feedbacks para a lista
app.get('/feedbacks/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM tbAvaliacacao WHERE pessoa_id = ? ORDER BY idAvaliacacao DESC";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});