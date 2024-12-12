const { Sequelize } = require('sequelize');
const db = require('../config/db');
const { DataTypes } = Sequelize;
const User = require('./UserModel');
const Transport = require('./Transportmodel');

const Order = db.define('orders', {
    oid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'uid'
        }
    },
    order_date: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Received', 'Shipping', 'Done', 'Cancelled', 'Complaint'),
        allowNull: false,
        defaultValue: 'Received'
    },
    transport_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Transport,
            key: 'tid'
        }
    },
    cancelAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completeAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'orders',
    timestamps: true, 
});

// Associations with explicit cascade options
Order.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

User.hasMany(Order, {
    foreignKey: 'user_id',
    as: 'orders',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Order.belongsTo(Transport, {
    foreignKey: 'transport_id',
    as: 'transport',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Transport.hasMany(Order, {
    foreignKey: 'transport_id',
    as: 'orders',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = Order;