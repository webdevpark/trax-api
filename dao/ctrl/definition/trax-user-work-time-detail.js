'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TraxUserWorkTimeDetail', {
        workDate: {
            type: DataTypes.DATEONLY,
            field: 'WorkDate',
            allowNull: false,
            primaryKey: true
        },
        userID: {
            type: DataTypes.INTEGER,
            field: 'UserID',
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'User',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        defaultWorkDuration: {
            type: DataTypes.INTEGER,
            field: 'DefaultWorkDuration',
            allowNull: false
        },
        systemOutageDuration: {
            type: DataTypes.INTEGER,
            field: 'SystemOutageDuration',
            allowNull: true
        },
        meetingDuration: {
            type: DataTypes.INTEGER,
            field: 'MeetingDuration',
            allowNull: true
        },
        trainingDuration: {
            type: DataTypes.INTEGER,
            field: 'TrainingDuration',
            allowNull: true
        },
        miscellaneousDuration: {
            type: DataTypes.INTEGER,
            field: 'MiscellaneousDuration',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'TraxUserWorkTimeDetail',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TraxUserWorkTimeDetail = model.TraxUserWorkTimeDetail;
    var User = model.User;

    TraxUserWorkTimeDetail.belongsTo(User, {
        as: 'User',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
