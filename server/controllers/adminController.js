const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');
const Note = require('../models/Note');
const File = require('../models/File');

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

        // Check if user is an admin or has admin role
        if (user.isAdmin === true || user.role === 'admin') {
            // Log for debugging
            console.log('Attempted delete of admin:', { 
                id: user._id, 
                isAdmin: user.isAdmin,
                role: user.role 
            });
            res.status(403);
            throw new Error('Not authorized to delete another admin user');
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

module.exports = {
    getUsers,
    getProjects,
    getStats,
    deleteUser,
    getUserDetails,
    updateUserRole
};