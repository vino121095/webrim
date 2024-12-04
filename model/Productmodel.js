// models/Product.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');
const {DataTypes} = Sequelize;

// Define Product model
const Product = sequelize.define('Product', {
    pid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mrp_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    technicians_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    distributors_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    brand_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    stocks: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    how_to_use: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    composition: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    item_details: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    organization_name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'products',
    timestamps: true,
});


module.exports = Product;
