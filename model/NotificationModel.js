const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Ordermodel');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: true,  // Make it nullable since not all notifications might be order-related
        references: {
            model: Order,
            key: 'order_id'
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {  // Add status field
        type: DataTypes.STRING,
        allowNull: true
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    transport: {
        type: DataTypes.STRING,
        allowNull: true  // Nullable if not all notifications involve transport
    },
    courier_id: {
        type: DataTypes.STRING,
        allowNull: true // Nullable if not all notifications involve a courier
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notifications',
    timestamps: true
});

// Define associations with eager loading of status
Notification.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Order.hasMany(Notification, {
    foreignKey: 'order_id',
    as: 'notifications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = Notification;