'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeFollowUp', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        completedJobTypeID: {
            type: DataTypes.INTEGER,
            field: 'CompletedJobTypeID',
            allowNull: false,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        newJobTypeID: {
            type: DataTypes.INTEGER,
            field: 'NewJobTypeID',
            allowNull: false,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        days: {
            type: DataTypes.INTEGER,
            field: 'Days',
            allowNull: false
        },
        hours: {
            type: DataTypes.INTEGER,
            field: 'Hours',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeFollowUp',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeFollowUp = model.JobTypeFollowUp;
    var JobType = model.JobType;

    JobTypeFollowUp.belongsTo(JobType, {
        as: 'CompletedJobType',
        foreignKey: 'CompletedJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeFollowUp.belongsTo(JobType, {
        as: 'NewJobType',
        foreignKey: 'NewJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
