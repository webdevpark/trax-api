'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('DepartmentFitsChangeDriverSet', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        fitsChangeDriverSetID: {
            type: DataTypes.INTEGER,
            field: 'FitsChangeDriverSetID',
            allowNull: false,
            references: {
                model: 'FitsChangeDriverSet',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        departmentID: {
            type: DataTypes.INTEGER,
            field: 'DepartmentID',
            allowNull: false,
            references: {
                model: 'Department',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'DepartmentFitsChangeDriverSet',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var DepartmentFitsChangeDriverSet = model.DepartmentFitsChangeDriverSet;
    var Department = model.Department;
    var FitsChangeDriverSet = model.FitsChangeDriverSet;

    DepartmentFitsChangeDriverSet.belongsTo(Department, {
        as: 'Department',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    DepartmentFitsChangeDriverSet.belongsTo(FitsChangeDriverSet, {
        as: 'FitsChangeDriverSet',
        foreignKey: 'FitsChangeDriverSetID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
