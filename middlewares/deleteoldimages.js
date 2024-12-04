const fs = require('fs');
const path = require('path');
const ProductImage = require('../model/productImagesmodel');

const deleteOldImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next();
        }
        
        const id = req.params.id;
        const existingImages = await ProductImage.findAll({
            where: { product_id: id }
        });

        // Delete each image file from the server
        for (const image of existingImages) {
            const filePath = path.join(__dirname, '..', image.image_path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting old image file:', err);
                }
                console.log('Deleted old images in server');
            });
        }

        await ProductImage.destroy({ where: { product_id: id } });

        next();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting old images', details: error.message });
    }
};

module.exports = deleteOldImages;
