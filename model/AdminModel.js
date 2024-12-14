const {Sequelize} = require('sequelize');
const {DataTypes} = Sequelize;
const sequelize = require('../config/db');

const Admin = sequelize.define('Admin', {
  aid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phonenumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
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
  storedetails: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  storeaddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileimagepath: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'admin',
  timestamps: true,
});

module.exports = Admin;
