'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('FilterOperator', {
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
        }
    }, {
        schema: 'public',
        tableName: 'FilterOperator',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var FilterOperator = model.FilterOperator;
    var JobTypeDepartmentFilter = model.JobTypeDepartmentFilter;
    var JobTypeDepartment = model.JobTypeDepartment;

    FilterOperator.hasMany(JobTypeDepartmentFilter, {
        as: 'FKJobtypedepartmentfilterFilteroperators',
        foreignKey: 'FilterOperatorID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    FilterOperator.belongsToMany(JobTypeDepartment, {
        as: 'JobTypeDepartmentFilterJobTypeDepartments',
        through: JobTypeDepartmentFilter,
        foreignKey: 'FilterOperatorID',
        otherKey: 'JobTypeDepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
