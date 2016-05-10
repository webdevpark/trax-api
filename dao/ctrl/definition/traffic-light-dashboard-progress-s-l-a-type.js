'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardProgressSLAType', {
        progressSLATypeID: {
            type: DataTypes.INTEGER,
            field: 'ProgressSLATypeID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        progressSLATypeName: {
            type: DataTypes.STRING(100),
            field: 'ProgressSLATypeName',
            allowNull: true
        },
        applicationStatusTypeID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationStatusTypeID',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardProgressSLAType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardProgressSLAType = model.TrafficLightDashboardProgressSLAType;
    var TrafficLightDashboardApplicationGestationCycle = model.TrafficLightDashboardApplicationGestationCycle;
    var TrafficLightDashboardProgressSLA = model.TrafficLightDashboardProgressSLA;
    var TrafficLightDashboardPushSLAType = model.TrafficLightDashboardPushSLAType;

    TrafficLightDashboardProgressSLAType.hasMany(TrafficLightDashboardApplicationGestationCycle, {
        as: 'FkTldagcNextprogressslatypeids',
        foreignKey: 'NextProgressSLATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TrafficLightDashboardProgressSLAType.hasMany(TrafficLightDashboardProgressSLA, {
        as: 'FkProgressslatypeids',
        foreignKey: 'ProgressSLATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TrafficLightDashboardProgressSLAType.hasMany(TrafficLightDashboardPushSLAType, {
        as: 'FkTrafficlightdashboardpushslatypeProgressslatypeids',
        foreignKey: 'ProgressSLATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
