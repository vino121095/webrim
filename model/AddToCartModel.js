// AddToCartModel.js
const { Sequelize } = require('sequelize');
const {DataTypes} = Sequelize;
const sequelize = require('../config/db');
const User = require('./UserModel');
const Products = require('./Productmodel');

const AddToCart = sequelize.define('AddToCart', {
  cid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  distributor_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  distributor_location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'add_to_cart',
  timestamps: true,
});

// Associations
User.hasMany(AddToCart, { 
  foreignKey: 'user_id', 
  as: 'cartItems', 
  sourceKey: 'uid',
  onDelete: 'CASCADE', // Add this to handle deletion
  onUpdate: 'CASCADE'  // Add this to handle updates
  });
AddToCart.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user', targetKey : 'uid',
  onDelete: 'CASCADE', // Add this to handle deletion
  onUpdate: 'CASCADE'  // Add this to handle updates
   });
AddToCart.belongsTo(Products, { 
  foreignKey: 'product_id', 
  as: 'product', 
  targetKey: 'product_id',
  onDelete: 'CASCADE', // Add this to handle deletion
  onUpdate: 'CASCADE'  // Add this to handle updates
});

module.exports = AddToCart;
