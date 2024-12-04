const { Sequelize } = require('sequelize');
const db = require('../config/db');
const { DataTypes } = Sequelize;

const Transport = db.define('transport', {
    tid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    travels_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dirver_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_person_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 15],
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    }
}, {
    tableName: 'transport',
    timestamps: true, 
});

module.exports = Transport;