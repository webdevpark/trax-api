'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardPushedSLA', {
        pushedSLAID: {
            type: DataTypes.INTEGER,
            field: 'PushedSLAID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        applicationID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationID',
            allowNull: false
        },
        pushSLATypeID: {
            type: DataTypes.INTEGER,
            field: 'PushSLATypeID',
            allowNull: false
        },
        created: {
            type: DataTypes.DATE,
            field: 'Created',
            allowNull: false
        },
        createdBypartyRoleID: {
            type: DataTypes.INTEGER,
            field: 'CreatedBypartyRoleID',
            allowNull: false
        },
        newSLADate: {
            type: DataTypes.DATE,
            field: 'NewSLADate',
            allowNull: false
        },
        pushSLAReasonID: {
            type: DataTypes.INTEGER,
            field: 'PushSLAReasonID',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardPushedSLA',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardPushedSLA = model.TrafficLightDashboardPushedSLA;

};
