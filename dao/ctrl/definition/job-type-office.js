'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeOffice', {
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
        officeID: {
            type: DataTypes.INTEGER,
            field: 'OfficeID',
            allowNull: false,
            references: {
                model: 'Office',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        roleID: {
            type: DataTypes.INTEGER,
            field: 'RoleID',
            allowNull: true,
            references: {
                model: 'Role',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        priority: {
            type: DataTypes.INTEGER,
            field: 'Priority',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeOffice',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeOffice = model.JobTypeOffice;
    var JobType = model.JobType;
    var Office = model.Office;
    var Role = model.Role;

    JobTypeOffice.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeOffice.belongsTo(Office, {
        as: 'Office',
        foreignKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeOffice.belongsTo(Role, {
        as: 'Role',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
