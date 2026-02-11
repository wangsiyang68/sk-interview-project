const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all incidents
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM incidents ORDER BY timestamp DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET single incident by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM incidents WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// CREATE new incident
router.post('/', async (req, res) => {
  try {
    const { timestamp, source_ip, severity, type, status, description } = req.body;
    
    // Basic validation
    if (!timestamp || !source_ip || !severity || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO incidents (timestamp, source_ip, severity, type, status, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [timestamp, source_ip, severity, type, status || 'open', description || null]
    );
    
    // Fetch the created incident
    const [rows] = await pool.query(
      'SELECT * FROM incidents WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// UPDATE incident
router.put('/:id', async (req, res) => {
  try {
    const { timestamp, source_ip, severity, type, status, description } = req.body;
    
    // Check if incident exists
    const [existing] = await pool.query(
      'SELECT * FROM incidents WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    await pool.query(
      `UPDATE incidents 
       SET timestamp = ?, source_ip = ?, severity = ?, type = ?, status = ?, description = ?
       WHERE id = ?`,
      [timestamp, source_ip, severity, type, status, description, req.params.id]
    );
    
    // Fetch updated incident
    const [rows] = await pool.query(
      'SELECT * FROM incidents WHERE id = ?',
      [req.params.id]
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// DELETE incident
router.delete('/:id', async (req, res) => {
  try {
    // Check if incident exists
    const [existing] = await pool.query(
      'SELECT * FROM incidents WHERE id = ?',
      [req.params.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    await pool.query('DELETE FROM incidents WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'Failed to delete incident' });
  }
});

module.exports = router;


