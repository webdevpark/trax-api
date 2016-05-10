'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CheckList', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(500),
            field: 'Name',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'CheckList',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CheckList = model.CheckList;
    var CheckListCheckListItemRelationship = model.CheckListCheckListItemRelationship;
    var JobType = model.JobType;
    var CheckListItem = model.CheckListItem;
    var WrapUpTemplate = model.WrapUpTemplate;

    CheckList.hasMany(CheckListCheckListItemRelationship, {
        as: 'FKChecklistchecklistitemrelationshipChecklistids',
        foreignKey: 'CheckListID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CheckList.hasMany(JobType, {
        as: 'FKJobtypeChecklistids',
        foreignKey: 'CheckListID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CheckList.belongsToMany(CheckListItem, {
        as: 'CheckListCheckListItemRelationshipCheckListItems',
        through: CheckListCheckListItemRelationship,
        foreignKey: 'CheckListID',
        otherKey: 'CheckListItemID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CheckList.belongsToMany(WrapUpTemplate, {
        as: 'JobTypeWrapUpTemplates',
        through: JobType,
        foreignKey: 'CheckListID',
        otherKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
