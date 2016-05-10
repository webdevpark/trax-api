'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CheckListItem', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(600),
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
        tableName: 'CheckListItem',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CheckListItem = model.CheckListItem;
    var CheckListCheckListItemRelationship = model.CheckListCheckListItemRelationship;
    var CheckList = model.CheckList;

    CheckListItem.hasMany(CheckListCheckListItemRelationship, {
        as: 'FKChecklistchecklistitemrelationshipChecklistitemids',
        foreignKey: 'CheckListItemID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CheckListItem.belongsToMany(CheckList, {
        as: 'CheckListCheckListItemRelationshipCheckLists',
        through: CheckListCheckListItemRelationship,
        foreignKey: 'CheckListItemID',
        otherKey: 'CheckListID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
