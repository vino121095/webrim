const { Sequelize } = require('sequelize');
const { DataTypes } = Sequelize;
const sequelize = require('../config/db');
const User = require('./UserModel');
const Product = require('./Productmodel');

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
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'pid'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    },
    close_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'forums',
    timestamps: true,
});

// Associations
User.hasMany(Forum, { foreignKey: 'user_id', as: 'forums', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Forum.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Product.hasMany(Forum, { foreignKey: 'product_id', as: 'forums', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Forum.belongsTo(Product, { foreignKey: 'product_id', as: 'product', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Forum;
