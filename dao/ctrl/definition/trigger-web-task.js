'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerWebTask', {
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
        triggerUriID: {
            type: DataTypes.INTEGER,
            field: 'TriggerUriID',
            allowNull: false,
            references: {
                model: 'TriggerUri',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'TriggerWebTask',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerWebTask = model.TriggerWebTask;
    var TriggerUri = model.TriggerUri;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;

    TriggerWebTask.belongsTo(TriggerUri, {
        as: 'TriggerUri',
        foreignKey: 'TriggerUriID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerWebTask.belongsTo(JobTypeTriggerPoint, {
        as: 'JobTypeTriggerPoint',
        foreignKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
