const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Productmodel');

const ProductImage = sequelize.define('ProductImage', {
    piid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,       
            key: 'pid',         
        },
        onDelete: 'CASCADE', // Add this to handle deletion
        onUpdate: 'CASCADE'  // Add this to handle updates    
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'product_images',
    timestamps: true,         
});

// Define associations
Product.hasMany(ProductImage, { 
    foreignKey: 'product_id',  
    sourceKey: 'pid', 
    as: 'images',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates        
});

ProductImage.belongsTo(Product, { 
    foreignKey: 'product_id',   
    targetKey: 'pid',
    as: 'product',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates    
});

module.exports = ProductImage;
