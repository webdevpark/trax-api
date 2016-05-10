'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TrafficLightDashboardFlaggedApplicationRuleType', {
        flaggedApplicationRuleTypeID: {
            type: DataTypes.INTEGER,
            field: 'FlaggedApplicationRuleTypeID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        flaggedApplicationRuleTypeName: {
            type: DataTypes.STRING(500),
            field: 'FlaggedApplicationRuleTypeName',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TrafficLightDashboardFlaggedApplicationRuleType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TrafficLightDashboardFlaggedApplicationRuleType = model.TrafficLightDashboardFlaggedApplicationRuleType;

};
