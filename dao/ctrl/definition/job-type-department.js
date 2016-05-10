'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeDepartment', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        jobTypeID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeID',
            allowNull: false,
            references: {
                model: 'JobType',
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
        },
        roleID: {
            type: DataTypes.INTEGER,
            field: 'RoleID',
            allowNull: true,
            references: {
                model: 'Role',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        priority: {
            type: DataTypes.INTEGER,
            field: 'Priority',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeDepartment',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeDepartment = model.JobTypeDepartment;
    var JobTypeDepartmentFilter = model.JobTypeDepartmentFilter;
    var Department = model.Department;
    var JobType = model.JobType;
    var Role = model.Role;
    var FilterOperator = model.FilterOperator;

    JobTypeDepartment.hasMany(JobTypeDepartmentFilter, {
        as: 'FKJobtypedepartmentfilterJobtypedepartments',
        foreignKey: 'JobTypeDepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeDepartment.belongsTo(Department, {
        as: 'Department',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeDepartment.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeDepartment.belongsTo(Role, {
        as: 'Role',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeDepartment.belongsToMany(FilterOperator, {
        as: 'JobTypeDepartmentFilterFilterOperators',
        through: JobTypeDepartmentFilter,
        foreignKey: 'JobTypeDepartmentID',
        otherKey: 'FilterOperatorID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
