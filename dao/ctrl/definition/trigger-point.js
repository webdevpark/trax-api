'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TriggerPoint', {
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
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TriggerPoint',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TriggerPoint = model.TriggerPoint;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;
    var JobType = model.JobType;

    TriggerPoint.hasMany(JobTypeTriggerPoint, {
        as: 'FKJobtypetriggerpointTriggerpoints',
        foreignKey: 'TriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TriggerPoint.belongsToMany(JobType, {
        as: 'JobTypeTriggerPointJobTypes',
        through: JobTypeTriggerPoint,
        foreignKey: 'TriggerPointID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
