const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// เชื่อมต่อ DB (ใช้ชื่อ Service ของ K8s)
const pool = new Pool({
  host: 'postgres-service', 
  user: 'myuser',
  password: 'mypassword',
  database: 'mydb',
  port: 5432,
});

// สร้าง Table ถ้ายังไม่มี
pool.query('CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, content TEXT)');

app.get('/api/data', async (req, res) => {
  const result = await pool.query('SELECT * FROM notes');
  res.json(result.rows);
});

app.post('/api/data', async (req, res) => {
  const { content } = req.body;
  await pool.query('INSERT INTO notes (content) VALUES ($1)', [content]);
  res.status(201).send('Saved');
});

app.listen(3000, () => console.log('Backend ranning on port 3000'));
