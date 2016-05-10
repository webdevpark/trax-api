'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardFlaggedApplication', {
        applicationID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationID',
            allowNull: true
        },
        applicationStatusTypeID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationStatusTypeID',
            allowNull: true
        },
        applicationSecurityID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationSecurityID',
            allowNull: true
        },
        applicationSecurityPurposeTypeID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationSecurityPurposeTypeID',
            allowNull: true
        },
        securityStateID: {
            type: DataTypes.INTEGER,
            field: 'SecurityStateID',
            allowNull: true
        },
        securityAddressDate: {
            type: DataTypes.DATE,
            field: 'SecurityAddressDate',
            allowNull: true
        },
        flagReason: {
            type: DataTypes.STRING(500),
            field: 'FlagReason',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardFlaggedApplications',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardFlaggedApplication = model.TrafficLightDashboardFlaggedApplication;

};
