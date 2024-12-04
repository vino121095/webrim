const { Sequelize } = require('sequelize');
const { DataTypes } = Sequelize;
const sequelize = require('../config/db');
const User = require('./UserModel');
const Forum = require('./ForumModel');

const ForumTake = sequelize.define('ForumTake', {
    ftid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    forum_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Forum,
            key: 'fid'
        }
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'uid'
        }
    },
    taken_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    tableName: 'forum_takes',
    timestamps: true,
});

// Associations
User.hasMany(ForumTake, {
    foreignKey: 'distributor_id',
    as: 'forumTakes'
});

ForumTake.belongsTo(User, {
    foreignKey: 'distributor_id',
    as: 'distributor'
});

Forum.hasMany(ForumTake, {
    foreignKey: 'fid',
    as: 'takes'
});

ForumTake.belongsTo(Forum, {
    foreignKey: 'forum_id', 
    as: 'forum', 
  });

module.exports = ForumTake;