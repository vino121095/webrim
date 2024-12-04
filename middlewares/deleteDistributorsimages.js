const fs = require('fs');
const path = require('path');
const DistributorImage = require('../model/DistributorImagesmodel'); 

const deleteDistributorImage = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next();
        }
        const distributorId = req.params.id;
        const existingImage = await DistributorImage.findOne({
            where: { distributor_id: distributorId }
        });

        if (existingImage) {
            const filePath = path.join(__dirname, '..', existingImage.image_path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting distributor image file:', err);
                } else {
                    console.log('Deleted distributor image:', existingImage.image_path);
                }
            });
            await DistributorImage.destroy({ where: { distributor_id: distributorId } });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting distributor image', details: error.message });
    }
};

module.exports = deleteDistributorImage;
