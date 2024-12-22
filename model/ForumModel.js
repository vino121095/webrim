// ForumModel.js
const { Sequelize } = require('sequelize');
const { DataTypes } = Sequelize;
const sequelize = require('../config/db');
const User = require('./UserModel');

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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    },
    close_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'forums',
    timestamps: true,
});

// Only define the User association here
Forum.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Forum, { foreignKey: 'user_id', as: 'forums' });

// Export the model before defining the many-to-many associations
module.exports = Forum;

// After exporting, define the many-to-many associations
const Product = require('./Productmodel');
const ForumProduct = require('./ForumProductModel');

// Define many-to-many relationship between Forum and Product
Forum.belongsToMany(Product, {
    through: ForumProduct,
    foreignKey: 'forum_id',
    otherKey: 'product_id',
    as: 'products'
});

Product.belongsToMany(Forum, {
    through: ForumProduct,
    foreignKey: 'product_id',
    otherKey: 'forum_id',
    as: 'forums'
});