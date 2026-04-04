const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000; // O servidor do seu site continua rodando na 3000

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// --- CONEXÃO CONFIGURADA PARA O BANCO OFICIAL NO RAILWAY ---
const db = mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'HMhYIbGRRSVOFiROAVJdwKynxQakxiIq',
    database: 'railway',
    port: 30041 
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no Railway:', err.message);
        console.log('DICA: Verifique se sua internet está ativa e se os dados do Railway no painel continuam os mesmos.');
        return;
    }
    console.log('✅ CONECTADO AO BANCO OFICIAL NA NUVEM!');
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { login, senha } = req.body;
    const sql = "SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?";
    
    db.query(sql, [login, senha], (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length > 0) {
            // Login correto - agora buscando do Railway!
            res.status(200).json({ message: "Sucesso", user: results[0] });
        } else {
            // Login ou senha errados
            res.status(401).json({ message: "Login ou senha incorretos" });
        }
    });
});

// Rota para carregar sua página principal (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor local rodando em http://localhost:${port}`);
    console.log(`📡 Conectado remotamente ao banco de dados no Railway`);
});