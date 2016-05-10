'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeTriggerPoint', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        jobTypeID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeID',
            allowNull: true,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        triggerPointID: {
            type: DataTypes.INTEGER,
            field: 'TriggerPointID',
            allowNull: false,
            references: {
                model: 'TriggerPoint',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeTriggerPoint',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;
    var TriggerScreenTask = model.TriggerScreenTask;
    var TriggerSqlTask = model.TriggerSqlTask;
    var TriggerWebTask = model.TriggerWebTask;
    var JobType = model.JobType;
    var TriggerPoint = model.TriggerPoint;
    var TriggerScreen = model.TriggerScreen;
    var TriggerQuery = model.TriggerQuery;
    var TriggerUri = model.TriggerUri;

    JobTypeTriggerPoint.hasMany(TriggerScreenTask, {
        as: 'FKTriggerscreentaskJobtypetriggerpoints',
        foreignKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.hasMany(TriggerSqlTask, {
        as: 'FKTriggersqltaskJobtypetriggerpoints',
        foreignKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.hasMany(TriggerWebTask, {
        as: 'FKTriggerwebtaskTriggerwebtasks',
        foreignKey: 'JobTypeTriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.belongsTo(TriggerPoint, {
        as: 'TriggerPoint',
        foreignKey: 'TriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.belongsToMany(TriggerScreen, {
        as: 'TriggerScreenTaskTriggerScreens',
        through: TriggerScreenTask,
        foreignKey: 'JobTypeTriggerPointID',
        otherKey: 'TriggerScreenID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.belongsToMany(TriggerQuery, {
        as: 'TriggerSqlTaskTriggerQueries',
        through: TriggerSqlTask,
        foreignKey: 'JobTypeTriggerPointID',
        otherKey: 'TriggerQueryID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTriggerPoint.belongsToMany(TriggerUri, {
        as: 'TriggerWebTaskTriggerUris',
        through: TriggerWebTask,
        foreignKey: 'JobTypeTriggerPointID',
        otherKey: 'TriggerUriID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
