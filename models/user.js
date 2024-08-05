const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;