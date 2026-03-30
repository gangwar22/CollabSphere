const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const Note = require('../models/Note');
const File = require('../models/File');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { projectName, description, isPublic } = req.body;

    if (!projectName || !description) {
        res.status(400);
        throw new Error('Please add a project name and description');
    }

    const project = await Project.create({
        projectName,
        description,
        isPublic,
        owner: req.user._id,
        members: [req.user._id],
    });

    res.status(201).json(project);
});

// @desc    Get user projects
// @route   GET /api/projects/my-projects
// @access  Private
const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({
        members: { $in: [req.user._id] },
    }).populate('owner', 'name email');

    res.status(200).json(projects);
});

// @desc    Add member to project
// @route   POST /api/projects/add-member
// @access  Private
const addMember = asyncHandler(async (req, res) => {
    const { projectId, email } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if requester is owner
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to add members');
    }

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
        res.status(404);
        throw new Error('User not found');
    }

    if (project.members.includes(userToAdd._id)) {
        res.status(400);
        throw new Error('User already a member');
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.status(200).json(project);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this project');
    }

    // Delete related notes and files
    await Note.deleteMany({ projectId: project._id });
    await File.deleteMany({ projectId: project._id });
    
    await project.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Get project details (Public or Member)
// @route   GET /api/projects/:id
// @access  Mixed
const getProjectDetails = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // If private, check membership
    if (!project.isPublic) {
        if (!req.user || !project.members.some(m => m._id.toString() === req.user._id.toString())) {
            res.status(401);
            throw new Error('Not authorized to view this project');
        }
    }

    res.status(200).json(project);
});

// @desc    Get public project details
// @route   GET /api/projects/public/:id
// @access  Public
const getPublicProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('owner', 'name')
        .select('-members'); // Don't leak members for public view

    if (!project || !project.isPublic) {
        res.status(404);
        throw new Error('Public project not found');
    }

    res.status(200).json(project);
});

// @desc    Update project visibility (Public/Private)
// @route   PUT /api/projects/:id/privacy
// @access  Private (Owner only)
const updateProjectPrivacy = asyncHandler(async (req, res) => {
    const { isPublic } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only owner can change privacy
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to change privacy settings');
    }

    project.isPublic = isPublic;
    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
});

module.exports = {
    createProject,
    getMyProjects,
    addMember,
    deleteProject,
    getProjectDetails,
    getPublicProject,
    updateProjectPrivacy,
};
