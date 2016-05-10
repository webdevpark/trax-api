'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerScreenTask', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        jobTypeTriggerPointID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeTriggerPointID',
            allowNull: false,
            references: {
                model: 'JobTypeTriggerPoint',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        triggerScreenID: {
            type: DataTypes.INTEGER,
            field: 'TriggerScreenID',
            allowNull: false,
            references: {
                model: 'TriggerScreen',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'TriggerScreenTask',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerScreenTask = model.TriggerScreenTask;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;
    var TriggerScreen = model.TriggerScreen;

    TriggerScreenTask.belongsTo(JobTypeTriggerPoint, {
        as: 'JobTypeTriggerPoint',
        foreignKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerScreenTask.belongsTo(TriggerScreen, {
        as: 'TriggerScreen',
        foreignKey: 'TriggerScreenID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
