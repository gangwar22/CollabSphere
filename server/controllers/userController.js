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

    // Create user
    const user = await User.create({
        name,
        email,
        password,
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

// @desc    Search for users
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.json([]);
    }

    // Clean query for email prefix search
    const cleanQuery = query.split('@')[0];

    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: `^${cleanQuery}`, $options: 'i' } }
        ]
    })
    .select('name email username _id role')
    .limit(10)
    .lean();

    // Attach public project counts for each user
    const Project = require('../models/Project');
    const usersWithProjects = await Promise.all(users.map(async (u) => {
        const publicProjectCount = await Project.countDocuments({
            owner: u._id,
            isPublic: true
        });
        return { ...u, publicProjectCount };
    }));

    res.json(usersWithProjects);
});

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get public projects for this user
    const Project = require('../models/Project');
    const publicProjects = await Project.find({
        owner: user._id,
        isPublic: true
    }).select('projectName description members createdAt');

    res.json({
        user,
        publicProjects
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

        if (req.file) {
            // Delete old profile picture if exists
            if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
                try {
                    const publicId = user.profilePicture.split('/').pop().split('.')[0];
                    const { cloudinary } = require('../config/cloudinary');
                    await cloudinary.uploader.destroy(`collabsphere_uploads/${publicId}`);
                } catch (err) {
                    console.error('Error deleting old profile pic:', err);
                }
            }
            user.profilePicture = req.file.path;
        }

        if (req.body.username) {
            // Check if username already exists
            const usernameExists = await User.findOne({ 
                username: req.body.username.toLowerCase(),
                _id: { $ne: user._id } 
            });
            if (usernameExists) {
                res.status(400);
                throw new Error('Username already taken');
            }
            user.username = req.body.username.toLowerCase();
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            username: updatedUser.username,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
            isAdmin: updatedUser.isAdmin,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateMe,
    makeAdmin,
    searchUsers,
    getUserProfile,
};
