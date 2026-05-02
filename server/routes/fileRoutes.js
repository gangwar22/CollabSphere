const express = require('express');
const router = express.Router();
const { uploadFile, getProjectFiles, getPublicProjectFiles, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/public/:projectId', getPublicProjectFiles); // Public endpoint (no auth required)
router.get('/:projectId', protect, getProjectFiles);
router.delete('/:id', protect, deleteFile);

module.exports = router;
