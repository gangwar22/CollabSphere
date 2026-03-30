const express = require('express');
const router = express.Router();
const {
    createNote,
    getProjectNotes,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createNote);
router.get('/:projectId', protect, getProjectNotes);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;
