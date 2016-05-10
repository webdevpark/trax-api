'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('WrapUpTemplateValue', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        wrapUpTemplateID: {
            type: DataTypes.INTEGER,
            field: 'WrapUpTemplateID',
            allowNull: false,
            references: {
                model: 'WrapUpTemplate',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        wrapUpValueID: {
            type: DataTypes.INTEGER,
            field: 'WrapUpValueID',
            allowNull: false,
            references: {
                model: 'WrapUpValue',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            field: 'SortOrder',
            allowNull: false
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            field: 'IsDefault',
            allowNull: true
        },
        establishedContact: {
            type: DataTypes.BOOLEAN,
            field: 'EstablishedContact',
            allowNull: true
        },
        attemptedContact: {
            type: DataTypes.BOOLEAN,
            field: 'AttemptedContact',
            allowNull: true
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
        }
    }, {
        schema: 'public',
        tableName: 'WrapUpTemplateValue',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var WrapUpTemplateValue = model.WrapUpTemplateValue;
    var RowStatusType = model.RowStatusType;
    var WrapUpTemplate = model.WrapUpTemplate;
    var WrapUpValue = model.WrapUpValue;

    WrapUpTemplateValue.belongsTo(RowStatusType, {
        as: 'RowStatusType',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplateValue.belongsTo(WrapUpTemplate, {
        as: 'WrapUpTemplate',
        foreignKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplateValue.belongsTo(WrapUpValue, {
        as: 'WrapUpValue',
        foreignKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
