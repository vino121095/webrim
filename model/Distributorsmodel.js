const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Make sure to update this path to your sequelize config

const Distributor = sequelize.define('Distributor', {
    did: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    companyname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gstnumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique : true
    },
    creditlimit: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    contact_person_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneno: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 15],
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    }
}, {
    tableName: 'distributors',
    timestamps: true 
});

module.exports = Distributor;
