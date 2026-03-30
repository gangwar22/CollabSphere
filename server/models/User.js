const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: function() { return !this.provider || this.provider === 'local'; },
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        provider: {
            type: String,
            enum: ['local', 'google', 'github'],
            default: 'local',
        },
        providerId: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
