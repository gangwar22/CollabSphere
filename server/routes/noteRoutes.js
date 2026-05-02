const express = require('express');
const router = express.Router();
const {
    createNote,
    getProjectNotes,
    getPublicProjectNotes,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createNote);
router.get('/public/:projectId', getPublicProjectNotes); // Public endpoint (no auth required)
router.get('/:projectId', protect, getProjectNotes);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);

module.exports = router;
