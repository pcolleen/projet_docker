const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Récupérer toutes les tâches
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches
 */
router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at ASC',
    [req.user.id]
  );
  res.json(result.rows);
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Créer une tâche
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Faire les courses
 *     responses:
 *       201:
 *         description: Tâche créée
 */
router.post('/', auth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Texte requis' });

  const result = await pool.query(
    'INSERT INTO todos (user_id, text) VALUES ($1, $2) RETURNING *',
    [req.user.id, text.trim()]
  );
  res.status(201).json(result.rows[0]);
});

/**
 * @swagger
 * /todos/{id}:
 *   patch:
 *     summary: Basculer l'état d'une tâche
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 */
router.patch('/:id', auth, async (req, res) => {
  const result = await pool.query(
    'UPDATE todos SET done = NOT done WHERE id = $1 AND user_id = $2 RETURNING *',
    [req.params.id, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Tâche introuvable' });
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tâche supprimée
 */
router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.status(204).send();
});

/**
 * @swagger
 * /todos/done:
 *   delete:
 *     summary: Supprimer toutes les tâches terminées
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Tâches terminées supprimées
 */
router.delete('/done', auth, async (req, res) => {
  await pool.query('DELETE FROM todos WHERE user_id = $1 AND done = TRUE', [req.user.id]);
  res.status(204).send();
});

module.exports = router;
