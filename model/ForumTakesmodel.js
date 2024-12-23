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
    fid: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Forum,
            key: 'fid'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'uid'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
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

// Update associations to use the correct foreign key
Forum.hasMany(ForumTake, {
    foreignKey: 'fid',
    as: 'takes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

ForumTake.belongsTo(Forum, {
    foreignKey: 'fid',
    as: 'forum',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

User.hasMany(ForumTake, {
    foreignKey: 'distributor_id',
    as: 'forumTakes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

ForumTake.belongsTo(User, {
    foreignKey: 'distributor_id',
    as: 'distributor',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

module.exports = ForumTake;