const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    meta: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
});

module.exports = AuditLog;
