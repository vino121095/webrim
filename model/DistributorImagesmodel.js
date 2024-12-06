const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 
const Distributor = require('./Distributorsmodel');
const DistributorImage = sequelize.define('DistributorImage', {
    disid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'distributors', 
            key: 'did'
        },
        onDelete: 'CASCADE', // Add this to handle deletion
        onUpdate: 'CASCADE'  // Add this to handle updates
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'distributor_images',
    timestamps: true
});

Distributor.hasMany(DistributorImage, { 
    foreignKey: 'distributor_id',  
    sourceKey: 'did',
    as: 'image',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates         
});

DistributorImage.belongsTo(Distributor, { 
    foreignKey: 'distributor_id', 
    targetKey: 'did',
    as: 'distributor',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates  
});

module.exports = DistributorImage;
