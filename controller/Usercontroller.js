require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../model/UserModel');
const Admin = require('../model/AdminModel');
const { where } = require('sequelize');
// Register User
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.json({ message: 'User with this useremail already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            username, 
            email, 
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.registerAdmin = async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        const existingUser = await Admin.findOne({ where: { email } });
        if (existingUser) {
            return res.json({ message: 'User with this useremail already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Admin.create({ 
            email, 
            password: hashedPassword
        });

        res.status(201).json({
            message: 'Admin registered successfully',
            user: { email: newUser.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user or admin by email
        const user = await User.findOne({ where: { email } });
        const admin = await Admin.findOne({ where: { email } });;

        if (!user && !admin) {
            return res.json({ message: 'Invalid email or password' });
        }

        let role;
        let entity; 
        let isMatch = false;

        if (user) {
            role = user.role;
            isMatch = await bcrypt.compare(password, user.password);
            entity = user;
        } else if (admin) {
            role = admin.role;
            isMatch = await bcrypt.compare(password, admin.password);
            entity = admin;
        }

        if (!isMatch) {
            return res.json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                email: entity.email,
                role,
            },
            process.env.ACCESS_SECRET_TOKEN,
            { expiresIn: '2h' }
        );
        const userData = { ...entity.get() };
            delete userData.password;

        res.status(200).json({
            message: 'Login successful',
            role,
            data: userData,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Update User Profile
exports.updateUserProfile = async (req, res) => {

    const uid  = req.params.id;
    const updateData = req.body; 

    try {
        // Check if the user exists
        const user = await User.findOne({ where: { uid } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        await user.update(updateData);

        res.status(200).json({
            message: 'User profile updated successfully',
            data: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    const uid = req.params.id;

    try {
        const user = await User.findOne({
            where: { uid },
            attributes: { exclude: ['password'] }, 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User profile fetched successfully',
            data: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
        });

        // Check if any users exist
        if (!users || users.length === 0) {
            return res.json({
                message: 'No users found'
            });
        }

        // Return success response with users
        res.status(200).json({
            message: 'Users fetched successfully',
            count: users.length,
            data: users
        });

    } catch (error) {
        // Log the error and return error response
        console.error(error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};
