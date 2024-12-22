const { Sequelize } = require('sequelize');
const { DataTypes } = Sequelize;
const sequelize = require('../config/db');
const Forum = require('./ForumModel');
const Product = require('./Productmodel');

const ForumProduct = sequelize.define('ForumProduct', {
    fpid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    forum_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Forum,
            key: 'fid',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'pid',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Not Taken', 'Taken'),
        allowNull: false,
        defaultValue: 'Not Taken',
    },
}, {
    tableName: 'forumproducts',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

// Associations
// Forum -> ForumProduct (One-to-Many)
Forum.hasMany(ForumProduct, {
    foreignKey: 'forum_id',
    as: 'forumProducts', // Alias for Forum's associated ForumProducts
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// ForumProduct -> Forum (Many-to-One)
ForumProduct.belongsTo(Forum, {
    foreignKey: 'forum_id',
    as: 'forum', // Alias for the associated Forum
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Product -> ForumProduct (One-to-Many)
Product.hasMany(ForumProduct, {
    foreignKey: 'product_id',
    as: 'productForumLinks', // Changed alias to avoid conflict with Forum's association
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// ForumProduct -> Product (Many-to-One)
ForumProduct.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product', // Alias for the associated Product
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

module.exports = ForumProduct;
