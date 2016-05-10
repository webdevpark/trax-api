'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeGate', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        jobTypeID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeID',
            allowNull: false,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        roleID: {
            type: DataTypes.INTEGER,
            field: 'RoleID',
            allowNull: false,
            references: {
                model: 'Role',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        precedence: {
            type: DataTypes.INTEGER,
            field: 'Precedence',
            allowNull: false
        },
        gateName: {
            type: DataTypes.STRING(50),
            field: 'GateName',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeGate',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeGate = model.JobTypeGate;
    var JobType = model.JobType;
    var Role = model.Role;

    JobTypeGate.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeGate.belongsTo(Role, {
        as: 'Role',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
