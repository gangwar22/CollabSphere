const express = require('express');
const router = express.Router();
const {
    createProject,
    getMyProjects,
    addMember,
    deleteProject,
    getProjectDetails,
    getPublicProject,
    updateProjectPrivacy,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.get('/my-projects', protect, getMyProjects);
router.post('/add-member', protect, addMember);
router.put('/:id/privacy', protect, updateProjectPrivacy); // Privacy update route
router.delete('/:id', protect, deleteProject);
router.get('/public/:id', getPublicProject); // Specific public endpoint
router.get('/:id', protect, getProjectDetails); // Member-only details

module.exports = router;
