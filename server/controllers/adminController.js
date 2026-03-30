const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');
const Note = require('../models/Note');
const File = require('../models/File');
const generateToken = require('../utils/generateToken');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').lean();
    
    // Enrich users with counts
    const enrichedUsers = await Promise.all(users.map(async (user) => {
        const projectCount = await Project.countDocuments({ owner: user._id });
        const noteCount = await Note.countDocuments({ createdBy: user._id });
        const fileCount = await File.countDocuments({ uploadedBy: user._id });
        
        return {
            ...user,
            name: user.name || user.username || user.email.split('@')[0] || 'Unknown User',
            email: user.email || 'N/A',
            isAdmin: user.isAdmin || user.role === 'admin' || false,
            projectCount,
            noteCount,
            fileCount
        };
    }));

    res.json(enrichedUsers);
});

// @desc    Get user details (Admin only)
// @route   GET /api/admin/users/:id
const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const projects = await Project.find({ owner: user._id });
    const notes = await Note.find({ createdBy: user._id });
    const files = await File.find({ uploadedBy: user._id });

    res.json({
        user,
        projects,
        notes,
        files
    });
});

// @desc    Delete user and all their data
// @route   DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('You cannot delete your own admin account');
        }

        console.log(`Admin ${req.user.name} is deleting user ${user.name} (${user._id})`);

        // Delete all data associated with user
        const projectsDeleted = await Project.deleteMany({ owner: user._id });
        const notesDeleted = await Note.deleteMany({ createdBy: user._id });
        const filesDeleted = await File.deleteMany({ uploadedBy: user._id });
        
        console.log(`Deleted: ${projectsDeleted.deletedCount} projects, ${notesDeleted.deletedCount} notes, ${filesDeleted.deletedCount} files`);

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Promote/Demote user admin status
// @route   PUT /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
    const { role, isAdmin } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = role || user.role;
        user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get global statistics (Admin only)
// @route   GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
    try {
        const users = await User.countDocuments({});
        const projects = await Project.countDocuments({});
        const notes = await Note.countDocuments({});
        const files = await File.countDocuments({});

        res.json({
            users,
            projects,
            notes,
            files
        });
    } catch (error) {
        res.status(500);
        throw new Error('Error fetching stats: ' + error.message);
    }
});

// @desc    Get all projects (Admin only)
// @route   GET /api/admin/projects
const getProjects = asyncHandler(async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate('owner', 'name email')
            .lean();
        res.json(projects);
    } catch (error) {
        res.status(500);
        throw new Error('Error fetching projects: ' + error.message);
    }
});

// @desc    Verify admin panel password
// @route   POST /api/admin/verify
const verifyAdminPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === adminPass) {
        let user;
        
        if (req.user) {
            // Promote currently logged-in user to admin if they are not already
            user = await User.findById(req.user._id);
            if (user && !user.isAdmin) {
                user.isAdmin = true;
                user.role = 'admin';
                await user.save();
                console.log(`User ${user.email} promoted to admin via password.`);
            }
        } else {
            // No session user, find or create the master admin account
            user = await User.findOne({ email: 'admin@gmail.com' });
            if (!user) {
                user = await User.create({
                    name: 'Platform Admin',
                    email: 'admin@gmail.com',
                    password: 'admin@password_reset_needed', // placeholder
                    isAdmin: true,
                    role: 'admin'
                });
                console.log('Master Admin account created.');
            } else if (!user.isAdmin) {
                user.isAdmin = true;
                user.role = 'admin';
                await user.save();
            }
        }

        res.json({ 
            success: true, 
            message: 'Admin access granted',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                role: user.role
            },
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid administrative password');
    }
});

module.exports = {
    getUsers,
    getProjects,
    getStats,
    deleteUser,
    getUserDetails,
    updateUserRole,
    verifyAdminPassword
};