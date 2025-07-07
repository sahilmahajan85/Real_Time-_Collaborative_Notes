const express = require('express');
const router = express.Router();
const Note = require('../models/Note'); // Make sure this file exists

// Create a new note
router.post('/', async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title || 'Untitled',
      content: '',
      updatedAt: new Date(),
    });
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update note content
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        content: req.body.content,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

module.exports = router;
