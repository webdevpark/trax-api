'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardPushSLAType', {
        pushSLATypeID: {
            type: DataTypes.INTEGER,
            field: 'PushSLATypeID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pushSLATypeName: {
            type: DataTypes.STRING(100),
            field: 'PushSLATypeName',
            allowNull: false
        },
        progressSLATypeID: {
            type: DataTypes.INTEGER,
            field: 'ProgressSLATypeID',
            allowNull: false,
            references: {
                model: 'TrafficLightDashboardProgressSLAType',
                key: 'ProgressSLATypeID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardPushSLAType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardPushSLAType = model.TrafficLightDashboardPushSLAType;
    var TrafficLightDashboardProgressSLAType = model.TrafficLightDashboardProgressSLAType;

    TrafficLightDashboardPushSLAType.belongsTo(TrafficLightDashboardProgressSLAType, {
        as: 'ProgressSLAType',
        foreignKey: 'ProgressSLATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
