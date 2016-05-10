'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('WrapUpValue', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.STRING(200),
            field: 'Value',
            allowNull: false
        },
        rowStatusTypeID: {
            type: DataTypes.INTEGER,
            field: 'RowStatusTypeID',
            allowNull: false,
            references: {
                model: 'RowStatusType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        requiresFollowUp: {
            type: DataTypes.BOOLEAN,
            field: 'RequiresFollowUp',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'WrapUpValue',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var WrapUpValue = model.WrapUpValue;
    var LmtcHoldConfiguration = model.LmtcHoldConfiguration;
    var WrapUpTemplateValue = model.WrapUpTemplateValue;
    var RowStatusType = model.RowStatusType;
    var JobType = model.JobType;
    var LmtcConfiguration = model.LmtcConfiguration;
    var WrapUpTemplate = model.WrapUpTemplate;

    WrapUpValue.hasMany(LmtcHoldConfiguration, {
        as: 'FKLmtcconfigurationWrapupvalues',
        foreignKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpValue.hasMany(WrapUpTemplateValue, {
        as: 'FKWrapuptemplatevalueWrapupvalues',
        foreignKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpValue.belongsTo(RowStatusType, {
        as: 'RowStatusType',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpValue.belongsToMany(JobType, {
        as: 'LmtcHoldConfigurationNextJobTypes',
        through: LmtcHoldConfiguration,
        foreignKey: 'WrapUpValueID',
        otherKey: 'NextJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpValue.belongsToMany(LmtcConfiguration, {
        as: 'LmtcHoldConfigurationLmtcConfigurations',
        through: LmtcHoldConfiguration,
        foreignKey: 'WrapUpValueID',
        otherKey: 'LmtcConfigurationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpValue.belongsToMany(RowStatusType, {
        as: 'WrapUpTemplateValueRowStatusTypes',
        through: WrapUpTemplateValue,
        foreignKey: 'WrapUpValueID',
        otherKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpValue.belongsToMany(WrapUpTemplate, {
        as: 'WrapUpTemplateValueWrapUpTemplates',
        through: WrapUpTemplateValue,
        foreignKey: 'WrapUpValueID',
        otherKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
