'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerSqlTask', {
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
        triggerQueryID: {
            type: DataTypes.INTEGER,
            field: 'TriggerQueryID',
            allowNull: false,
            references: {
                model: 'TriggerQuery',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'TriggerSqlTask',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerSqlTask = model.TriggerSqlTask;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;
    var TriggerQuery = model.TriggerQuery;

    TriggerSqlTask.belongsTo(JobTypeTriggerPoint, {
        as: 'JobTypeTriggerPoint',
        foreignKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerSqlTask.belongsTo(TriggerQuery, {
        as: 'TriggerQuery',
        foreignKey: 'TriggerQueryID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
