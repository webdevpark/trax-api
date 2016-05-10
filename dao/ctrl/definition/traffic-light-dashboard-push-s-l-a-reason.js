'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardPushSLAReason', {
        pushSLAReasonID: {
            type: DataTypes.INTEGER,
            field: 'PushSLAReasonID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pushSLAReasonName: {
            type: DataTypes.STRING(100),
            field: 'PushSLAReasonName',
            allowNull: false
        },
        pushSLAReasonDescription: {
            type: DataTypes.STRING(500),
            field: 'PushSLAReasonDescription',
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardPushSLAReason',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardPushSLAReason = model.TrafficLightDashboardPushSLAReason;

};
