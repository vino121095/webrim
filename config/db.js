const Sequelize = require('sequelize');

const sequelize = new Sequelize('rimhub', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: '3306'
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();
module.exports = sequelize;
