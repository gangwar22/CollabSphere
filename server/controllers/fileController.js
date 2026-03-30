const asyncHandler = require('express-async-handler');
const File = require('../models/File');
const Project = require('../models/Project');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    const { projectId } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check membership
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isMember && !isOwner) {
        res.status(401);
        throw new Error('Not authorized to upload files to this project');
    }

    // FEATURE 2: REPLACE FILE WITH SAME NAME
    const existingFile = await File.findOne({ 
        fileName: req.file.originalname, 
        projectId 
    });

    if (existingFile) {
        console.log(`Replacing existing file: ${existingFile.fileName}`);
        // 1. Delete old file from Cloudinary
        if (existingFile.cloudinaryId) {
            await cloudinary.uploader.destroy(existingFile.cloudinaryId);
        } else {
            // Fallback if cloudinaryId wasn't stored (extract from URL)
            const publicId = existingFile.fileUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`collabsphere_uploads/${publicId}`);
        }
        // 2. Delete old file document from MongoDB
        await existingFile.deleteOne();
    }

    // 3. Upload new file is already handled by multer-storage-cloudinary middleware
    // req.file.path is the secure_url
    // req.file.filename is the public_id provided by multer-storage-cloudinary

    console.log('RECV FILE:', req.file);

    // 4. Save new file data in MongoDB
    const file = await File.create({
        fileName: req.file.originalname,
        fileUrl: req.file.path, 
        cloudinaryId: req.file.filename,
        projectId,
        uploadedBy: req.user._id,
    });

    res.status(201).json(file);
});

// @desc    Get project files
// @route   GET /api/files/:projectId
// @access  Private
const getProjectFiles = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // If private, check membership
    if (!project.isPublic && !project.members.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized to view files');
    }

    const files = await File.find({ projectId: req.params.projectId }).populate('uploadedBy', 'name');
    res.status(200).json(files);
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    const project = await Project.findById(file.projectId);
    
    // Check if requester is owner of project or person who uploaded the file
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isUploader = file.uploadedBy.toString() === req.user._id.toString();

    if (!isOwner && !isUploader) {
        res.status(401);
        throw new Error('Not authorized to delete this file');
    }

    // 1. Delete from Cloudinary if it exists
    try {
        if (file.cloudinaryId) {
            await cloudinary.uploader.destroy(file.cloudinaryId);
        } else {
            // Fallback: extract publicId from URL for older files
            const publicId = file.fileUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`collabsphere_uploads/${publicId}`);
        }
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }

    // 2. Delete from MongoDB
    await file.deleteOne();

    res.status(200).json({ message: 'File removed successfully' });
});

module.exports = {
    uploadFile,
    getProjectFiles,
    deleteFile,
};
