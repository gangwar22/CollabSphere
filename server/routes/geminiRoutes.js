const express = require('express');
const router = express.Router();
const {
    explainContent,
    generateDocs,
    generateReadme,
} = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/explain', protect, explainContent);
router.post('/docs', protect, generateDocs);
router.post('/readme', protect, generateReadme);

module.exports = router;
