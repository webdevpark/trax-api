'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CheckListCheckListItemRelationship', {
        checkListCheckListItemRelationshipID: {
            type: DataTypes.INTEGER,
            field: 'CheckListCheckListItemRelationshipID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        checkListID: {
            type: DataTypes.INTEGER,
            field: 'CheckListID',
            allowNull: false,
            references: {
                model: 'CheckList',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        checkListItemID: {
            type: DataTypes.INTEGER,
            field: 'CheckListItemID',
            allowNull: false,
            references: {
                model: 'CheckListItem',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'CheckListCheckListItemRelationship',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CheckListCheckListItemRelationship = model.CheckListCheckListItemRelationship;
    var CheckList = model.CheckList;
    var CheckListItem = model.CheckListItem;

    CheckListCheckListItemRelationship.belongsTo(CheckList, {
        as: 'CheckList',
        foreignKey: 'CheckListID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CheckListCheckListItemRelationship.belongsTo(CheckListItem, {
        as: 'CheckListItem',
        foreignKey: 'CheckListItemID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
