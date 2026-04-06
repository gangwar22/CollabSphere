const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const Note = require('../models/Note');
const File = require('../models/File');
const Invitation = require('../models/Invitation');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { projectName, description, isPublic } = req.body;

    if (!projectName) {
        res.status(400);
        throw new Error('Please add a project name');
    }

    const project = await Project.create({
        projectName,
        description: description || '',
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
    // Specifically search for projects where members array contains the user's ID
    const projects = await Project.find({
        members: req.user._id
    }).populate('owner', 'name email');

    res.status(200).json(projects);
});

// @desc    Add member (Send Invitation)
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
        throw new Error(`User with email ${email} not found. Please ask them to register first.`);
    }

    if (project.members.some(memberId => memberId.toString() === userToAdd._id.toString())) {
        res.status(400);
        throw new Error('User already a member of this project');
    }

    // Check for existing pending invitation
    const existingInvite = await Invitation.findOne({
        project: projectId,
        invitee: userToAdd._id,
        status: 'pending'
    });

    if (existingInvite) {
        res.status(400);
        throw new Error('An invitation is already pending for this user');
    }

    // Create invitation instead of direct add
    await Invitation.create({
        project: projectId,
        inviter: req.user._id,
        invitee: userToAdd._id,
    });

    res.status(200).json({ message: 'Invitation sent successfully' });
});

// @desc    Get my invitations
// @route   GET /api/projects/invitations
// @access  Private
const getMyInvitations = asyncHandler(async (req, res) => {
    const invitations = await Invitation.find({ invitee: req.user._id, status: 'pending' })
        .populate('project', 'projectName')
        .populate('inviter', 'name email');
    res.json(invitations);
});

// @desc    Respond to invitation
// @route   POST /api/projects/invitations/:id/respond
// @access  Private
const respondToInvitation = asyncHandler(async (req, res) => {
    const { accept } = req.body;
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation || invitation.invitee.toString() !== req.user._id.toString() || invitation.status !== 'pending') {
        res.status(404);
        throw new Error('Invitation not found or unauthorized');
    }

    if (accept) {
        invitation.status = 'accepted';
        const project = await Project.findById(invitation.project);
        if (project) {
            // Check if user is already a member
            const alreadyMember = project.members.some(m => m.toString() === invitation.invitee.toString());
            
            if (!alreadyMember) {
                // Ensure ownership logic is also respected if they were somehow not in members
                project.members.push(invitation.invitee);
                await project.save();
                console.log(`User ${invitation.invitee} added to project ${project._id}`);
            }
        } else {
            res.status(404);
            throw new Error('Project associated with invitation not found');
        }
    } else {
        invitation.status = 'rejected';
    }

    await invitation.save();
    res.json({ 
        message: accept ? 'Invitation accepted and project added' : 'Invitation rejected',
        projectId: invitation.project 
    });
});

// @desc    Remove member from project
// @route   POST /api/projects/remove-member
// @access  Private (Owner only)
const removeMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to remove members');
    }

    // Cannot remove owner
    if (userId === project.owner.toString()) {
        res.status(400);
        throw new Error('Cannot remove the project owner');
    }

    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    res.status(200).json({ message: 'Member removed successfully', members: project.members });
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
    // Populate both owner and members as objects
    const project = await Project.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // If private, check membership
    if (!project.isPublic) {
        // req.user might be undefined if it's a guest trying to access a private project
        if (!req.user) {
            res.status(401);
            throw new Error('Please log in to view this private project');
        }

        // Check if req.user._id is in the members list
        // Since we populated members, each 'm' is an object with '_id'
        const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
        const isOwner = project.owner._id.toString() === req.user._id.toString();

        if (!isMember && !isOwner) {
            res.status(401);
            throw new Error('Not authorized to view this private project');
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

// @desc    Update project description (About), README, and Links
// @route   PUT /api/projects/:id
// @access  Private (Owner only)
const updateProject = asyncHandler(async (req, res) => {
    const { projectName, description, readme, links } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only owner can update project
    if (project.owner.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update project');
    }

    if (projectName) project.projectName = projectName;
    if (description !== undefined) project.description = description;
    if (readme !== undefined) project.readme = readme;
    if (links !== undefined) project.links = links;

    const updatedProject = await project.save();
    
    // Return populated project to match what frontend expects
    const populatedProject = await Project.findById(updatedProject._id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

    res.status(200).json(populatedProject);
});

module.exports = {
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
    updateProject,
};
