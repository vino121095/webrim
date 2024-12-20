const Distributor = require('../model/Distributorsmodel');
const User = require('../model/UserModel');
const DistributorImage = require('../model/DistributorImagesmodel');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

exports.addDistributor = async (req, res) => {

    const { 
        companyname, 
        location, 
        gstnumber, 
        creditlimit, 
        contact_person_name, 
        phoneno, 
        email, 
        password 
    } = req.body;

    try {
        // Check if a distributor with this email or GST number already exists
        const existingDistributor = await Distributor.findOne({ 
            where: { 
                [Op.or]: [
                    { email: email },
                    { gstnumber: gstnumber }
                ]
            } 
        });
        if (existingDistributor) {
            return res.json({ 
                message: 'Distributor with this email or GST number already exists' 
            });
        }
        const existingUser = await User.findOne({where: {email}});
        if (existingUser) {
            return res.json({
                message: 'User with this email already exists'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the distributor
        const distributor = await Distributor.create({
            companyname,
            location,
            gstnumber,
            creditlimit,
            current_credit_limit: creditlimit,
            contact_person_name,
            phoneno,
            email
        });

        if (req.files && req.files.length > 0) {
            const imageEntries = req.files.map((file) => ({
                distributor_id: distributor.did,
                image_path: file.path,
            }));

           const images = await DistributorImage.bulkCreate(imageEntries);
           if(!images){
            return res.json({
                message: 'Error in uploading images'
            });
           }
        }
        const user = await User.create({
            username: contact_person_name,
            company_name: companyname,
            creditlimit:  creditlimit,
            current_credit_limit: creditlimit,
            email,
            mobile_number : phoneno,
            password: hashedPassword,
            role: 'distributor'
        }); 

        res.status(201).json({ 
            message: 'Distributor added successfully', 
            distributor: distributor
        });
    } catch (error) {
        console.error('Distributor registration error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get all distributors
exports.getAllDistributors = async (req, res) => {
    try {
        const distributors = await Distributor.findAll({
            include: [
                { model: DistributorImage,
                    as: 'image',        
                    attributes: ['image_path'],  
                 }
            ]
        });
        res.status(200).json(distributors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a distributor by ID
exports.getDistributorById = async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id, {
            include: [
                { model: DistributorImage,
                    as: 'image',        
                    attributes: ['image_path'],  
                 }
            ]
        });
        if (distributor) {
            res.status(200).json(distributor);
        } else {
            res.status(404).json({ message: 'Distributor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a distributor
exports.updateDistributor = async (req, res) => {
    try {
        const distributor = await Distributor.findOne({
            where: { did: req.params.id },
            include: [{
                model: DistributorImage,
                as: 'image',
                attributes: ['image_path']
            }]
        });
        const user = await User.findOne({where: {email: distributor.email}});

        if (!distributor) {
            return res.status(404).json({ message: 'Distributor not found' });
        }

        // Update distributor data if provided
        // if (Object.keys(req.body).length > 0) {
        //     await distributor.update(req.body);
        // }

        const updateData = { ...req.body };
    
        if ('password' in updateData) {
            if (!updateData.password || updateData.password.trim() === '') {
                // If password is empty or just whitespace, remove it from update data
                // This means the existing password will be retained
                delete updateData.password;
            } else {
                // Hash the new password
                const saltRounds = 10;
                updateData.password = await bcrypt.hash(updateData.password, saltRounds);
            }
        }

        // Perform updates if there are fields to update
        if (Object.keys(updateData).length > 0) {
            await distributor.update(updateData);
            await user.update(updateData);
        }
        
        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            // Add new images
            const newDistributorImages = req.files.map(file => ({
                distributor_id: distributor.did,
                image_path: file.path
            }));
            await DistributorImage.bulkCreate(newDistributorImages);
        }

        // Fetch updated distributor with images
        const updatedDistributor = await Distributor.findOne({
            where: { did: req.params.id },
            include: [{
                model: DistributorImage,
                as: 'image',
                attributes: ['image_path']
            }]
        });

        res.status(200).json({
            message: 'Distributor updated successfully',
            distributor: updatedDistributor
        });

    } catch (error) {
        console.error('Error updating distributor:', error);
        res.status(500).json({
            error: error.message || 'Error updating distributor'
        });
    }
};



// Delete a distributor
exports.deleteDistributor = async (req, res) => {
    try {
        const distributor = await Distributor.findByPk(req.params.id);
        const user = await User.findOne({where: {email: distributor.email}});
        if (distributor) {
            await distributor.destroy();
            await user.destroy();
            res.status(204).json({ message: 'Distributor deleted successfully' });
        } else {
            res.status(404).json({ message: 'Distributor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search for distributors by query
exports.searchDistributors = async (req, res) => {
    try {
        const { query } = req.query;
        const distributors = await Distributor.findAll({
            where: {
                [Op.or]: [
                    { companyname: { [Op.like]: `%${query}%` } },
                    { contact_person_name: { [Op.like]: `%${query}%` } },
                    { location: { [Op.like]: `%${query}%` } },
                ]
            },
            include: [
                {
                    model: DistributorImage,
                    as: 'image',
                    attributes: ['image_path']
                }
            ]
        });
        
        if(distributors.length === 0){
            return res.status(404).json({message:"Distributor Not found"});
        }

        res.status(200).json(distributors);
    } catch (error) {
        console.error('Error in searchDistributors:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.addArchiveForDistributor = async (req, res) => {
    try {
        const distributor_id = req.params.id;

        // Check if distributor exists
        const distributor = await Distributor.findOne({
            where: {
                did: distributor_id
            }
        });
        if (!distributor) {
            return res.json({ message: 'Distributor not found' });
        }

        // Update the distributor to mark as archived
        await distributor.update({ isarchived: true });

        res.status(200).json({
            message: 'Distributor archived successfully',
            distributor,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.removeArchiveForDistributor = async (req, res) => {
    try {
        const distributor_id = req.params.id;

        // Check if the distributor exists
        const distributor = await Distributor.findOne({
            where: {
                did: distributor_id
            }
        });
        if (!distributor) {
            return res.json({ error: 'Distributor not found' });
        }

        // Update the distributor to mark as not archived
        await distributor.update({ isarchived: false });

        res.status(200).json({
            message: 'Distributor unarchived successfully',
            distributor,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add this function to your distributor controller file

exports.updateDistributorCreditLimit = async (req, res) => {
    const { id } = req.params;
    const { current_credit_limit } = req.body;

    try {
        // Find the distributor
        const distributor = await Distributor.findByPk(id);
        if (!distributor) {
            return res.status(404).json({ message: 'Distributor not found' });
        }

        // Find the associated user
        const user = await User.findOne({ where: { email: distributor.email } });
        if (!user) {
            return res.status(404).json({ message: 'Associated user not found' });
        }

        // Calculate the difference to add to credit limit
        const creditLimitIncrease = parseFloat(current_credit_limit) - parseFloat(distributor.current_credit_limit);

        // Update distributor
        await distributor.update({
            current_credit_limit: current_credit_limit,
            creditlimit: parseFloat(distributor.creditlimit) + creditLimitIncrease
        });

        // Update user
        await user.update({
            current_credit_limit: current_credit_limit,
            creditlimit: parseFloat(user.creditlimit) + creditLimitIncrease
        });

        res.status(200).json({
            message: 'Credit limit updated successfully',
            distributor: {
                current_credit_limit: distributor.current_credit_limit,
                creditlimit: distributor.creditlimit
            },
            user: {
                current_credit_limit: user.current_credit_limit,
                creditlimit: user.creditlimit
            }
        });

    } catch (error) {
        console.error('Error updating credit limit:', error);
        res.status(500).json({
            message: 'Error updating credit limit',
            error: error.message
        });
    }
};
