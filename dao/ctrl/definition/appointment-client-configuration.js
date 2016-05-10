'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('AppointmentClientConfiguration', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            field: 'Name',
            allowNull: false
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
        durationInMins: {
            type: DataTypes.INTEGER,
            field: 'DurationInMins',
            allowNull: false
        },
        intervalInMins: {
            type: DataTypes.INTEGER,
            field: 'IntervalInMins',
            allowNull: true
        },
        mondayStart: {
            type: DataTypes.STRING(5),
            field: 'MondayStart',
            allowNull: true
        },
        mondayEnd: {
            type: DataTypes.STRING(5),
            field: 'MondayEnd',
            allowNull: true
        },
        tuesdayStart: {
            type: DataTypes.STRING(5),
            field: 'TuesdayStart',
            allowNull: true
        },
        tuesdayEnd: {
            type: DataTypes.STRING(5),
            field: 'TuesdayEnd',
            allowNull: true
        },
        wednesdayStart: {
            type: DataTypes.STRING(5),
            field: 'WednesdayStart',
            allowNull: true
        },
        wednesdayEnd: {
            type: DataTypes.STRING(5),
            field: 'WednesdayEnd',
            allowNull: true
        },
        thursdayStart: {
            type: DataTypes.STRING(5),
            field: 'ThursdayStart',
            allowNull: true
        },
        thursdayEnd: {
            type: DataTypes.STRING(5),
            field: 'ThursdayEnd',
            allowNull: true
        },
        fridayStart: {
            type: DataTypes.STRING(5),
            field: 'FridayStart',
            allowNull: true
        },
        fridayEnd: {
            type: DataTypes.STRING(5),
            field: 'FridayEnd',
            allowNull: true
        },
        saturdayStart: {
            type: DataTypes.STRING(5),
            field: 'SaturdayStart',
            allowNull: true
        },
        saturdayEnd: {
            type: DataTypes.STRING(5),
            field: 'SaturdayEnd',
            allowNull: true
        },
        sundayStart: {
            type: DataTypes.STRING(5),
            field: 'SundayStart',
            allowNull: true
        },
        sundayEnd: {
            type: DataTypes.STRING(5),
            field: 'SundayEnd',
            allowNull: true
        },
        scheduleImmediatePhoneCallJobTypeId: {
            type: DataTypes.INTEGER,
            field: 'ScheduleImmediatePhoneCallJobTypeId',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'AppointmentClientConfiguration',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var AppointmentClientConfiguration = model.AppointmentClientConfiguration;
    var JobType = model.JobType;
    var Role = model.Role;

    AppointmentClientConfiguration.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    AppointmentClientConfiguration.belongsTo(Role, {
        as: 'Role',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
