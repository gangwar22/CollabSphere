const express = require('express');
const router = express.Router();
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const {
    registerUser,
    loginUser,
    getMe,
    updateMe,
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

// GOOGLE AUTH
router.get('/google', (req, res, next) => {
    // Dynamically store the client URL so we can redirect back to the exact same port
    if (req.headers.referer) {
        try {
            req.session.clientUrl = new URL(req.headers.referer).origin;
        } catch (e) {
            req.session.clientUrl = process.env.CLIENT_URL;
        }
    } else {
        req.session.clientUrl = process.env.CLIENT_URL;
    }
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    const redirectUrl = req.session.clientUrl || process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${redirectUrl}/oauth-success?token=${token}`);
});

// GITHUB AUTH
router.get('/github', (req, res, next) => {
    // Dynamically store the client URL so we can redirect back to the exact same port
    if (req.headers.referer) {
        try {
            req.session.clientUrl = new URL(req.headers.referer).origin;
        } catch (e) {
            req.session.clientUrl = process.env.CLIENT_URL;
        }
    } else {
        req.session.clientUrl = process.env.CLIENT_URL;
    }
    next();
}, passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    const token = generateToken(req.user._id);
    const redirectUrl = req.session.clientUrl || process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${redirectUrl}/oauth-success?token=${token}`);
});

module.exports = router;
