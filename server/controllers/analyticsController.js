const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Note = require('../models/Note');
const File = require('../models/File');
const User = require('../models/User');

// @desc    Get project activity analytics
// @route   GET /api/analytics/:projectId
// @access  Private
const getProjectAnalytics = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Activity summary
    const totalNotes = await Note.countDocuments({ projectId });
    const totalFiles = await File.countDocuments({ projectId });

    // Contributions by member
    const memberActivity = await Promise.all(
        project.members.map(async (memberId) => {
            const user = await User.findById(memberId).select('name');
            const notesCreated = await Note.countDocuments({ projectId, createdBy: memberId });
            const filesUploaded = await File.countDocuments({ projectId, uploadedBy: memberId });

            return {
                userId: memberId,
                name: user ? user.name : 'Unknown',
                notesCreated,
                filesUploaded,
            };
        })
    );

    res.status(200).json({
        projectSummary: {
            totalNotes,
            totalFiles,
            memberCount: project.members.length,
        },
        memberActivity,
    });
});

module.exports = {
    getProjectAnalytics,
};
