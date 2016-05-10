'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerUri', {
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
        uri: {
            type: DataTypes.STRING(4096),
            field: 'Uri',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TriggerUri',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerUri = model.TriggerUri;
    var TriggerWebTask = model.TriggerWebTask;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;

    TriggerUri.hasMany(TriggerWebTask, {
        as: 'FKTriggerwebtaskTriggeruris',
        foreignKey: 'TriggerUriID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerUri.belongsToMany(JobTypeTriggerPoint, {
        as: 'TriggerWebTaskJobTypeTriggerPoints',
        through: TriggerWebTask,
        foreignKey: 'TriggerUriID',
        otherKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
