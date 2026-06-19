const express = require('express');
const router = express.Router();
const pool = require('../db');

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

// Toutes les tâches groupées par colonne
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY created_at ASC');
  const board = {
    todo: result.rows.filter(t => t.status === 'todo'),
    in_progress: result.rows.filter(t => t.status === 'in_progress'),
    done: result.rows.filter(t => t.status === 'done'),
  };
  res.json(board);
});

// Créer une tâche
router.post('/', async (req, res) => {
  const { title, description, status = 'todo' } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  const result = await pool.query(
    'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
    [title, description, status]
  );
  res.status(201).json(result.rows[0]);
});

// Déplacer une tâche vers une autre colonne
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  const result = await pool.query(
    'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Tâche introuvable' });
  res.json(result.rows[0]);
});

// Modifier une tâche
router.put('/:id', async (req, res) => {
  const { title, description } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *',
    [title, description, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Tâche introuvable' });
  res.json(result.rows[0]);
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Tâche introuvable' });
  res.json({ message: 'Supprimée' });
});

module.exports = router;
