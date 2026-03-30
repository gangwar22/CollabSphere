const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user - First user is Admin for development
    const userCount = await User.countDocuments();
    const user = await User.create({
        name,
        email,
        password,
        isAdmin: userCount === 0,
        role: userCount === 0 ? 'admin' : 'user'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/users/profile
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

const makeAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.isAdmin = true;
        user.role = 'admin';
        await user.save();
        res.json({ message: 'User promoted to Admin successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    makeAdmin,
};
