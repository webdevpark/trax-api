'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('WrapUpTemplate', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(200),
            field: 'Name',
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
        }
    }, {
        schema: 'public',
        tableName: 'WrapUpTemplate',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var WrapUpTemplate = model.WrapUpTemplate;
    var JobType = model.JobType;
    var WrapUpTemplateValue = model.WrapUpTemplateValue;
    var RowStatusType = model.RowStatusType;
    var CheckList = model.CheckList;
    var WrapUpValue = model.WrapUpValue;

    WrapUpTemplate.hasMany(JobType, {
        as: 'FKJobtypeWrapuptemplates',
        foreignKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplate.hasMany(WrapUpTemplateValue, {
        as: 'FKWrapuptemplatevalueWrapuptemplates',
        foreignKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplate.belongsTo(RowStatusType, {
        as: 'RowStatusType',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplate.belongsToMany(CheckList, {
        as: 'JobTypeCheckLists',
        through: JobType,
        foreignKey: 'WrapUpTemplateID',
        otherKey: 'CheckListID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplate.belongsToMany(RowStatusType, {
        as: 'WrapUpTemplateValueRowStatusTypes',
        through: WrapUpTemplateValue,
        foreignKey: 'WrapUpTemplateID',
        otherKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    WrapUpTemplate.belongsToMany(WrapUpValue, {
        as: 'WrapUpTemplateValueWrapUpValues',
        through: WrapUpTemplateValue,
        foreignKey: 'WrapUpTemplateID',
        otherKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
