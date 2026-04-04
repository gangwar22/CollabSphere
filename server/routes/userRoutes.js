const express = require('express');
const router = express.Router();
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const {
    registerUser,
    loginUser,
    getMe,
    updateMe,
    makeAdmin,
    searchUsers,
    getUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getMe);
router.put('/profile', protect, upload.single('profilePicture'), updateMe);
router.get('/search', protect, searchUsers);
router.get('/profile/:id', protect, getUserProfile);
router.get('/make-admin', protect, makeAdmin);

// GOOGLE AUTH
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/oauth-success?token=${token}`);
});

// GITHUB AUTH
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/oauth-success?token=${token}`);
});

module.exports = router;
