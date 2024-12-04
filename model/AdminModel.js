const {Sequelize} = require('sequelize');
const {DataTypes} = Sequelize;
const sequelize = require('../config/db');

const Admin = sequelize.define('Admin', {
  aid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin',
  },
}, {
  tableName: 'admin',
  timestamps: true,
});

module.exports = Admin;
