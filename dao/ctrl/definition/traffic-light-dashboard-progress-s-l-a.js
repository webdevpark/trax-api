'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardProgressSLA', {
        progressSLAID: {
            type: DataTypes.INTEGER,
            field: 'ProgressSLAID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
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
        applicationSecurityPurposeTypeID: {
            type: DataTypes.INTEGER,
            field: 'ApplicationSecurityPurposeTypeID',
            allowNull: false
        },
        stateID: {
            type: DataTypes.INTEGER,
            field: 'StateID',
            allowNull: false
        },
        progressLevel1SLADays: {
            type: DataTypes.INTEGER,
            field: 'ProgressLevel1SLADays',
            allowNull: false
        },
        progressLevel2SLADays: {
            type: DataTypes.INTEGER,
            field: 'ProgressLevel2SLADays',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardProgressSLA',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardProgressSLA = model.TrafficLightDashboardProgressSLA;
    var TrafficLightDashboardProgressSLAType = model.TrafficLightDashboardProgressSLAType;

    TrafficLightDashboardProgressSLA.belongsTo(TrafficLightDashboardProgressSLAType, {
        as: 'ProgressSLAType',
        foreignKey: 'ProgressSLATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
