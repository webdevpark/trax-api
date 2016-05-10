'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('RowStatusType', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            field: 'Name',
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(100),
            field: 'Description',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'RowStatusType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var RowStatusType = model.RowStatusType;
    var User = model.User;
    var WrapUpTemplate = model.WrapUpTemplate;
    var WrapUpTemplateValue = model.WrapUpTemplateValue;
    var WrapUpValue = model.WrapUpValue;
    var Department = model.Department;

    RowStatusType.hasMany(User, {
        as: 'FKUserRowstatustypes',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    RowStatusType.hasMany(WrapUpTemplate, {
        as: 'FKWrapuptemplateRowstatustypes',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    RowStatusType.hasMany(WrapUpTemplateValue, {
        as: 'FKWrapuptemplatevalueRowstatustypes',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    RowStatusType.hasMany(WrapUpValue, {
        as: 'FKWrapupvalueRowstatustypes',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    RowStatusType.belongsToMany(Department, {
        as: 'UserReportingdepartments',
        through: User,
        foreignKey: 'RowStatusTypeID',
        otherKey: 'ReportingDepartment',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    RowStatusType.belongsToMany(WrapUpTemplate, {
        as: 'WrapUpTemplateValueWrapUpTemplates',
        through: WrapUpTemplateValue,
        foreignKey: 'RowStatusTypeID',
        otherKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    RowStatusType.belongsToMany(WrapUpValue, {
        as: 'WrapUpTemplateValueWrapUpValues',
        through: WrapUpTemplateValue,
        foreignKey: 'RowStatusTypeID',
        otherKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
