const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

console.log(process.env.DB_HOST);

const app = express();
app.use(express.json());

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const initDatabase = () => {
    connection.query('SELECT 1', (err) => {
        if (err) {
            console.log('Database not ready, retry 3 second again...', err.message);
            setTimeout(initDatabase, 3000);
            return;
        }

        console.log('Database connected');

        connection.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        )`);
    });
};

initDatabase();

app.get('/', (req, res) => {
    res.send('Praktikum Docker - I Wayan Astawa Putra(2415354028)');
});

app.get('/users', (req, res) => {
    connection.query('SELECT id, name FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.post('/users', (req, res) => {
    const { name } = req.body;
    connection.query('INSERT INTO users (name) VALUES (?)', [name], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, name });
    });
});

app.put('/users/:id', (req, res) => {
    const { name } = req.body;
    const id = req.params.id;

    connection.query('UPDATE users SET name=? WHERE id=?', [name, id], (err) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json({
                message: 'User Updated',
            });
        }
    });
});

app.delete('/users/:id', (req, res) => {
    const id = req.params.id;

    connection.query('DELETE FROM users WHERE id=?', [id], (err) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json({
                message: 'User deleted',
            });
        }
    });
});

app.listen(process.env.APP_PORT, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});
