const express = require('express');
const router = express.Router();
const pool = require('../db');

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at ASC');
    const board = {
      todo: result.rows.filter(t => t.status === 'todo'),
      in_progress: result.rows.filter(t => t.status === 'in_progress'),
      done: result.rows.filter(t => t.status === 'done'),
    };
    res.json(board);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status = 'todo' } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Titre requis' });
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

    const result = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description, status]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide' });

    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Tâche introuvable' });
    res.json({ message: 'Supprimée' });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
