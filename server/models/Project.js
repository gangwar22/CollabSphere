const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        projectName: {
            type: String,
            required: [true, 'Please add a project name'],
        },
        description: {
            type: String,
            default: '',
        },
        readme: {
            type: String,
            default: '',
        },
        links: [
            {
                label: String,
                url: String,
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Project', projectSchema);
