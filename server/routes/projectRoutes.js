const express = require('express');
const router = express.Router();
const {
    createProject,
    getMyProjects,
    addMember,
    removeMember,
    getMyInvitations,
    respondToInvitation,
    deleteProject,
    getProjectDetails,
    getPublicProject,
    updateProjectPrivacy,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.get('/my-projects', protect, getMyProjects);
router.get('/invitations', protect, getMyInvitations);
router.post('/invitations/:id/respond', protect, respondToInvitation);
router.post('/add-member', protect, addMember);
router.post('/remove-member', protect, removeMember);
router.put('/:id/privacy', protect, updateProjectPrivacy); // Privacy update route
router.delete('/:id', protect, deleteProject);
router.get('/public/:id', getPublicProject); // Specific public endpoint
router.get('/:id', protect, getProjectDetails); // Member-only details

module.exports = router;
