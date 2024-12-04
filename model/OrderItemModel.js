const { Sequelize } = require('sequelize');
const { DataTypes } = Sequelize;
const sequelize = require('../config/db');
const Order = require('./Ordermodel');
const Product = require('./Productmodel');

const OrderItem = sequelize.define('OrderItem', {
    oitems_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Order,
            key: 'order_id',
        },
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Product,
            key: 'product_id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    tableName: 'order_items',
    timestamps: true,
});

// Relationships

// An order can have many order items
Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    sourceKey: 'order_id',
});

// A product can have many order items
Product.hasMany(OrderItem, {
    foreignKey: 'product_id',
    sourceKey: 'product_id',
});

// Each order item belongs to an order
OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    targetKey: 'order_id',
});

// Each order item belongs to a product
OrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    targetKey: 'product_id',
});

module.exports = OrderItem;
