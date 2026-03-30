const express = require('express');
const router = express.Router();
const {
    getUsers,
    getProjects,
    getStats,
    deleteUser,
    getUserDetails,
    updateUserRole,
    verifyAdminPassword
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, admin, getUserDetails);
router.get('/projects', protect, admin, getProjects);
router.get('/stats', protect, admin, getStats);
router.post('/verify', protect, admin, verifyAdminPassword);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;