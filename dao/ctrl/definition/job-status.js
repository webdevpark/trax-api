'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobStatus', {
        traxSerial: {
            type: DataTypes.CHAR(24),
            field: 'TraxSerial',
            allowNull: false,
            primaryKey: true
        },
        armed: {
            type: DataTypes.BOOLEAN,
            field: 'Armed',
            allowNull: false
        },
        created: {
            type: DataTypes.DATE,
            field: 'Created',
            allowNull: false
        },
        assigned: {
            type: DataTypes.DATE,
            field: 'Assigned',
            allowNull: true
        },
        assignedUserID: {
            type: DataTypes.INTEGER,
            field: 'AssignedUserID',
            allowNull: true,
            references: {
                model: 'User',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        onHold: {
            type: DataTypes.DATE,
            field: 'OnHold',
            allowNull: true
        },
        followUp: {
            type: DataTypes.DATE,
            field: 'FollowUp',
            allowNull: true
        },
        completed: {
            type: DataTypes.DATE,
            field: 'Completed',
            allowNull: true
        },
        closed: {
            type: DataTypes.DATE,
            field: 'Closed',
            allowNull: true
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
        priority: {
            type: DataTypes.INTEGER,
            field: 'Priority',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'JobStatus',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobStatus = model.JobStatus;
    var JobStatusPartition = model.JobStatusPartition;
    var JobType = model.JobType;
    var User = model.User;

    JobStatus.hasMany(JobStatusPartition, {
        as: 'FKJobstatuspartitionJobstatuses',
        foreignKey: 'TraxSerial',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobStatus.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobStatus.belongsTo(User, {
        as: 'AssignedUser',
        foreignKey: 'AssignedUserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
