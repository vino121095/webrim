const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your database connection
const Order = require('./Ordermodel'); // Import Order model for association
const Product = require('./Productmodel'); // Import Product model for association

const Shipment = sequelize.define('Shipment', {
    sid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, 
        allowNull: false,
    },
    shipment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Order,
            key: 'order_id'
        },
        onDelete: 'CASCADE', // Add this to handle deletion
        onUpdate: 'CASCADE'  // Add this to handle updates
    },
    distributor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
    },
    dispatch_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    dispatch_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    transport: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shipment_items: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('shipment_items');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (error) {
                console.error('Error parsing shipment items:', error);
                return [];
            }
        },
        set(value) {
            this.setDataValue('shipment_items', JSON.stringify(value));
        }
    },
    status: {
        type: DataTypes.ENUM('Shipment', 'Delivered', 'Cancelled'),
        defaultValue: 'Shipment'
    }
}, {
    tableName: 'shipments',
    timestamps: true, 
    indexes: [
        {
            unique: true,
            fields: ['shipment_id']
        },
        {
            fields: ['order_id']
        }
    ]
});

// Define associations
Shipment.belongsTo(Order, {
    foreignKey: 'order_id',
    onDelete: 'CASCADE', // Add this to handle deletion
    onUpdate: 'CASCADE'  // Add this to handle updates
});

// Method to validate shipment items
Shipment.prototype.validateShipmentItems = function() {
    const items = this.shipment_items;
    return items.every(item => 
        item.product_id && 
        item.product_name && 
        item.quantity > 0 && 
        item.price >= 0
    );
};

module.exports = Shipment;