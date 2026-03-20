const express = require('express');

const mysql = require('mysql2');

const cors = require('cors');



const app = express();

app.use(cors());

app.use(express.json());



// Conexão com o Banco de Dados (Railway)

const db = mysql.createPool('mysql://root:EdiCrrOOgYNiSQtDJYSXaHKwEtNCFiiO@autorack.proxy.rlwy.net:42256/railway');



db.getConnection((err, conn) => {

    if (err) console.log("❌ Erro de Conexão:", err.message);

    else {

        console.log("🚀 CONECTADO AO BANCO NO RAILWAY!");

        conn.release();

    }

});



app.post('/api/pessoas', (req, res) => {

    const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;

    const sql = "INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id) VALUES (?, ?, ?, ?, ?)";

   

    db.query(sql, [nome, cpf, nascimento, telefone, pessoa_tipo_id], (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).json({ message: "Erro ao salvar", error: err.message });

        }

        res.json({ message: "✅ Salvo com sucesso!" });

    });

});



// --- MUDANÇA IMPORTANTE AQUI ---

// O Railway define a porta automaticamente, por isso usamos process.env.PORT

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {

    console.log(`🔥 Servidor online na porta ${PORT}`);

});