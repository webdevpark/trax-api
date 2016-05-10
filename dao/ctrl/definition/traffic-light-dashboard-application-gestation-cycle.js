'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardApplicationGestationCycle', {
        applicationStatusGestationCycleID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationStatusGestationCycleID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        applicationStatusTypeID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationStatusTypeID',
            allowNull: false
        },
        nextProgressSLATypeID: {
            type: DataTypes.INTEGER,
            field: 'NextProgressSLATypeID',
            allowNull: false,
            references: {
                model: 'TrafficLightDashboardProgressSLAType',
                key: 'ProgressSLATypeID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardApplicationGestationCycle',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardApplicationGestationCycle = model.TrafficLightDashboardApplicationGestationCycle;
    var TrafficLightDashboardProgressSLAType = model.TrafficLightDashboardProgressSLAType;

    TrafficLightDashboardApplicationGestationCycle.belongsTo(TrafficLightDashboardProgressSLAType, {
        as: 'NextProgressSLAType',
        foreignKey: 'NextProgressSLATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
