'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('FitsChangeDriverSetFitsChangeDriverType', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        fitsChangeDriverSetId: {
            type: DataTypes.INTEGER,
            field: 'FitsChangeDriverSetId',
            allowNull: false,
            references: {
                model: 'FitsChangeDriverSet',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        fitsChangeDriverTypeId: {
            type: DataTypes.INTEGER,
            field: 'FitsChangeDriverTypeId',
            allowNull: false,
            references: {
                model: 'FitsChangeDriverType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'FitsChangeDriverSetFitsChangeDriverType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var FitsChangeDriverSetFitsChangeDriverType = model.FitsChangeDriverSetFitsChangeDriverType;
    var FitsChangeDriverSet = model.FitsChangeDriverSet;
    var FitsChangeDriverType = model.FitsChangeDriverType;

    FitsChangeDriverSetFitsChangeDriverType.belongsTo(FitsChangeDriverSet, {
        as: 'FitsChangeDriverSet',
        foreignKey: 'FitsChangeDriverSetId',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    FitsChangeDriverSetFitsChangeDriverType.belongsTo(FitsChangeDriverType, {
        as: 'FitsChangeDriverType',
        foreignKey: 'FitsChangeDriverTypeId',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
