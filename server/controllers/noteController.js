const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');
const Project = require('../models/Project');
const { cloudinary } = require('../config/cloudinary');

// Helper to upload markdown to Cloudinary
const uploadNoteToCloudinary = async (note) => {
    try {
        const result = await cloudinary.uploader.upload(`data:text/markdown;base64,${Buffer.from(note.content).toString('base64')}`, {
            folder: 'collabsphere_notes',
            public_id: `note_${note._id}`,
            resource_type: 'raw',
            overwrite: true
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Note Upload Error:', error);
        return null;
    }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
    const { title, content, projectId } = req.body;

    if (!title || !content || !projectId) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check membership or ownership
    const isMember = project.members.some(memberId => memberId.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
        console.log('AUTH FAILED:', { user: req.user._id, projectMembers: project.members, projectOwner: project.owner });
        res.status(401);
        throw new Error('Not authorized to add notes to this project');
    }

    const note = await Note.create({
        title,
        content,
        projectId,
        createdBy: req.user._id,
    });

    // Sync to Cloudinary (Don't let errors here block the response)
    try {
        await uploadNoteToCloudinary(note);
    } catch (err) {
        console.error('Initial Cloudinary Sync Failed');
    }

    res.status(201).json(note);
});

// @desc    Get project notes
// @route   GET /api/notes/:projectId
// @access  Private
const getProjectNotes = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check membership or ownership
    const isMember = project.members.some(memberId => memberId.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();

    // If private, check membership/ownership
    if (!project.isPublic && !isMember && !isOwner) {
        res.status(401);
        throw new Error('Not authorized to view notes');
    }

    const notes = await Note.find({ projectId: req.params.projectId }).populate('createdBy', 'name');
    res.status(200).json(notes);
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    const project = await Project.findById(note.projectId);
    
    const isMember = project.members.some(memberId => memberId.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
        res.status(401);
        throw new Error('Not authorized to update this note');
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    // Sync update to Cloudinary
    try {
        await uploadNoteToCloudinary(updatedNote);
    } catch (err) {
        console.error('Update Cloudinary Sync Failed');
    }

    res.status(200).json(updatedNote);
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    const project = await Project.findById(note.projectId);

    const isMember = project.members.some(memberId => memberId.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
        res.status(401);
        throw new Error('Not authorized to delete this note');
    }

    // Delete from Cloudinary
    try {
        await cloudinary.uploader.destroy(`collabsphere_notes/note_${note._id}`, { resource_type: 'raw' });
    } catch (error) {
        console.error('Cloudinary Note Delete Error:', error);
    }

    await note.deleteOne();

    res.status(200).json({ message: 'Note removed' });
});

module.exports = {
    createNote,
    getProjectNotes,
    updateNote,
    deleteNote,
};
