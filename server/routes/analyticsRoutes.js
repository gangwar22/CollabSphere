const express = require('express');
const router = express.Router();
const { getProjectAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:projectId', protect, getProjectAnalytics);

module.exports = router;
