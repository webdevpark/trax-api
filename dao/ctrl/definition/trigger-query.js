'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerQuery', {
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
        query: {
            type: DataTypes.STRING(4096),
            field: 'Query',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TriggerQuery',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerQuery = model.TriggerQuery;
    var TriggerSqlTask = model.TriggerSqlTask;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;

    TriggerQuery.hasMany(TriggerSqlTask, {
        as: 'FKTriggersqltaskTriggerqueries',
        foreignKey: 'TriggerQueryID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerQuery.belongsToMany(JobTypeTriggerPoint, {
        as: 'TriggerSqlTaskJobTypeTriggerPoints',
        through: TriggerSqlTask,
        foreignKey: 'TriggerQueryID',
        otherKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
