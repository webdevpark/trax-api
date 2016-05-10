'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('FitsChangeDriverSet', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        schema: 'public',
        tableName: 'FitsChangeDriverSet',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var FitsChangeDriverSet = model.FitsChangeDriverSet;
    var DepartmentFitsChangeDriverSet = model.DepartmentFitsChangeDriverSet;
    var FitsChangeDriverSetFitsChangeDriverType = model.FitsChangeDriverSetFitsChangeDriverType;
    var Department = model.Department;
    var FitsChangeDriverType = model.FitsChangeDriverType;

    FitsChangeDriverSet.hasMany(DepartmentFitsChangeDriverSet, {
        as: 'FKDepartmentfitschangedriversetFitschangedriverset1s',
        foreignKey: 'FitsChangeDriverSetID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    FitsChangeDriverSet.hasMany(FitsChangeDriverSetFitsChangeDriverType, {
        as: 'FKFitschangedriversetfitschangedrivertypeFitschangedriversets',
        foreignKey: 'FitsChangeDriverSetId',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    FitsChangeDriverSet.belongsToMany(Department, {
        as: 'DepartmentFitsChangeDriverSetDepartments',
        through: DepartmentFitsChangeDriverSet,
        foreignKey: 'FitsChangeDriverSetID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    FitsChangeDriverSet.belongsToMany(FitsChangeDriverType, {
        as: 'FitsChangeDriverSetFitsChangeDriverTypeFitsChangeDriverTypes',
        through: FitsChangeDriverSetFitsChangeDriverType,
        foreignKey: 'FitsChangeDriverSetId',
        otherKey: 'FitsChangeDriverTypeId',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
