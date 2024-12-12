const bcrypt = require('bcrypt');
const Admin = require('../model/AdminModel');

// Search Admin by Email
exports.searchAdminByEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({
            where: { email },
            attributes: { exclude: ['password'] }
        });

        if (!admin) {
            return res.json({ message: 'Admin not found' });
        }

        res.status(200).json({
            message: 'Admin found',
            data: admin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Admin Password
exports.updateAdminPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    // Validate password match
    if (newPassword !== confirmPassword) {
        return res.json({ message: 'Passwords do not match' });
    }

    try {
        // Find admin by email
        const admin = await Admin.findOne({ where: { email } });

        if (!admin) {
            return res.json({ message: 'Admin not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin's password
        await admin.update({ password: hashedPassword });

        res.status(200).json({
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};