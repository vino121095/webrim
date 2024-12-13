const bcrypt = require('bcrypt');
const Admin = require('../model/AdminModel');


exports.updateAdminProfile = async (req, res) => {
    const aid = req.params.id;
    const updateFields = {};

    // Only add fields to updateFields if they exist in the request body
    if (req.body.name !== undefined) updateFields.name = req.body.name;
    if (req.body.phonenumber !== undefined) updateFields.phonenumber = req.body.phonenumber;
    if (req.body.email !== undefined) updateFields.email = req.body.email;
    if (req.body.storedetails !== undefined) updateFields.storedetails = req.body.storedetails;
    if (req.body.storeaddress !== undefined) updateFields.storeaddress = req.body.storeaddress;

    try {
        // Find the admin
        const admin = await Admin.findOne({
            where: {
                aid: aid
            }
        });

        if (!admin) {
            return res.json({ message: 'Admin not found' });
        }

        // Handle profile image upload if exists
        if (req.file) {
            updateFields.profileimagepath = req.file.path;
        }

        // Update only the fields that were provided
        await admin.update(updateFields);

        // Reload the admin to get the updated data
        await admin.reload();

        res.json({
            message: 'Profile updated successfully',
            admin: {
                aid: admin.aid,
                name: admin.name,
                email: admin.email,
                phonenumber: admin.phonenumber,
                storedetails: admin.storedetails,
                storeaddress: admin.storeaddress,
                profileimagepath: admin.profileimagepath
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAdminProfile = async (req, res) => {
    const aid = req.params.id;

    try {
        // Fetch the admin profile, including specific fields
        const admin = await Admin.findOne({
            where: { aid: aid },
            attributes: ['aid', 'name', 'email', 'phonenumber', 'storedetails', 'storeaddress', 'profileimagepath'] // Include only these fields
        });

        // Check if the admin record exists
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Return the admin profile
        res.json({ admin });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


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