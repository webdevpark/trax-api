'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('FitsChangeDriverType', {
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
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'FitsChangeDriverType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var FitsChangeDriverType = model.FitsChangeDriverType;
    var FitsChangeDriverSetFitsChangeDriverType = model.FitsChangeDriverSetFitsChangeDriverType;
    var FitsChangeDriverSet = model.FitsChangeDriverSet;

    FitsChangeDriverType.hasMany(FitsChangeDriverSetFitsChangeDriverType, {
        as: 'FKFitschangedriversetfitschangedrivertypeFitschangedrivertypes',
        foreignKey: 'FitsChangeDriverTypeId',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    FitsChangeDriverType.belongsToMany(FitsChangeDriverSet, {
        as: 'FitsChangeDriverSetFitsChangeDriverTypeFitsChangeDriverSets',
        through: FitsChangeDriverSetFitsChangeDriverType,
        foreignKey: 'FitsChangeDriverTypeId',
        otherKey: 'FitsChangeDriverSetId',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
