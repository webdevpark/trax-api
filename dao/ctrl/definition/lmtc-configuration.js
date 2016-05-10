'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('LmtcConfiguration', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        lmtcConfigurationTypeID: {
            type: DataTypes.INTEGER,
            field: 'LmtcConfigurationTypeID',
            allowNull: false,
            references: {
                model: 'LmtcConfigurationType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        productCategoryTypeID: {
            type: DataTypes.INTEGER,
            field: 'ProductCategoryTypeID',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'LmtcConfiguration',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var LmtcConfiguration = model.LmtcConfiguration;
    var LmtcHoldConfiguration = model.LmtcHoldConfiguration;
    var LmtcConfigurationType = model.LmtcConfigurationType;
    var JobType = model.JobType;
    var WrapUpValue = model.WrapUpValue;

    LmtcConfiguration.hasMany(LmtcHoldConfiguration, {
        as: 'FKLmtcholdconfigurationLmtcconfigurations',
        foreignKey: 'LmtcConfigurationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    LmtcConfiguration.belongsTo(LmtcConfigurationType, {
        as: 'LmtcConfigurationType',
        foreignKey: 'LmtcConfigurationTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    LmtcConfiguration.belongsToMany(JobType, {
        as: 'LmtcHoldConfigurationNextJobTypes',
        through: LmtcHoldConfiguration,
        foreignKey: 'LmtcConfigurationID',
        otherKey: 'NextJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    LmtcConfiguration.belongsToMany(WrapUpValue, {
        as: 'LmtcHoldConfigurationWrapUpValues',
        through: LmtcHoldConfiguration,
        foreignKey: 'LmtcConfigurationID',
        otherKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
