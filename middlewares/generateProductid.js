const Product = require('../model/Productmodel');

const generateProductId = async (req, res, next) => {
    try {
        // Fetch the latest product based on the creation date
        const lastProduct = await Product.findOne({
            order: [['createdAt', 'DESC']],
        });

        let newProductId;
        if (lastProduct && lastProduct.product_id.startsWith('FE')) {
            const lastIdNumber = parseInt(lastProduct.product_id.slice(2));
            const newIdNumber = lastIdNumber + 1;
            newProductId = `FE${newIdNumber.toString().padStart(2, '0')}`;
        } else {
            newProductId = 'FE01';
        }

        // Add the new product ID to the request body so it can be used later
        req.body.product_id = newProductId;

        // Proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating product ID' });
    }
};

module.exports = generateProductId;
