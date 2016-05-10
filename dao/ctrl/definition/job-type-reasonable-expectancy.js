'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeReasonableExpectancy', {
        jobTypeID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeID',
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        activityEventTypeId: {
            type: DataTypes.INTEGER,
            field: 'ActivityEventTypeId',
            allowNull: false,
            primaryKey: true
        },
        reasonableExpectancy: {
            type: DataTypes.DECIMAL,
            field: 'ReasonableExpectancy',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeReasonableExpectancy',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeReasonableExpectancy = model.JobTypeReasonableExpectancy;
    var JobType = model.JobType;

    JobTypeReasonableExpectancy.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
