const { Sequelize } = require('sequelize');
const { DataTypes } = Sequelize;
const sequelize = require('../config/db');
const User = require('./UserModel');
const Product = require('./Productmodel'); // Make sure to import the Product model

const Forum = sequelize.define('Forum', {
    fid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'uid'
        },
        onDelete: 'CASCADE', // Add this to handle deletion
        onUpdate: 'CASCADE'  // Add this to handle updates
    },
    product_id: { // Add this field to link to the Product
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'pid' // Assuming 'pid' is the primary key in your Product model
        },
        onDelete: 'CASCADE', // Add this to handle deletion
        onUpdate: 'CASCADE'  // Add this to handle updates
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 15],
        },
    },
    status: {
        type: DataTypes.ENUM('Not Taken', 'Taken'),
        allowNull: false,
        defaultValue: 'Not Taken'
    }
}, {
    tableName: 'forums',
    timestamps: true,
});

// User associations
User.hasMany(Forum, {
    foreignKey: 'user_id',
    as: 'forums',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates
});

Forum.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates
});

// Product associations
Product.hasMany(Forum, {
    foreignKey: 'product_id',
    as: 'forums',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates
});

Forum.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates
});

module.exports = Forum;