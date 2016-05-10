'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerScreen', {
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
            type: DataTypes.STRING(250),
            field: 'Uri',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TriggerScreen',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerScreen = model.TriggerScreen;
    var TriggerScreenTask = model.TriggerScreenTask;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;

    TriggerScreen.hasMany(TriggerScreenTask, {
        as: 'FKTriggerscreentaskTriggerscreens',
        foreignKey: 'TriggerScreenID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerScreen.belongsToMany(JobTypeTriggerPoint, {
        as: 'TriggerScreenTaskJobTypeTriggerPoints',
        through: TriggerScreenTask,
        foreignKey: 'TriggerScreenID',
        otherKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
