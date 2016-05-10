'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Department', {
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
        },
        isPausable: {
            type: DataTypes.BOOLEAN,
            field: 'IsPausable',
            allowNull: false,
            defaultValue: false
        }
    }, {
        schema: 'public',
        tableName: 'Department',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var Department = model.Department;
    var DepartmentFitsChangeDriverSet = model.DepartmentFitsChangeDriverSet;
    var JobTypeDepartment = model.JobTypeDepartment;
    var JobTypeUserQA = model.JobTypeUserQA;
    var QADepartmentJobType = model.QADepartmentJobType;
    var User = model.User;
    var UserDepartment = model.UserDepartment;
    var FitsChangeDriverSet = model.FitsChangeDriverSet;
    var JobType = model.JobType;
    var Role = model.Role;
    var QAType = model.QAType;
    var RowStatusType = model.RowStatusType;

    Department.hasMany(DepartmentFitsChangeDriverSet, {
        as: 'FKDepartmentfitschangedriversetDepartment1s',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.hasMany(JobTypeDepartment, {
        as: 'FKJobtypedepartmentDepartments',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.hasMany(JobTypeUserQA, {
        as: 'FKJobtypeuserqaDepartments',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.hasMany(QADepartmentJobType, {
        as: 'FKQadepartmentjobtypeDepartments',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.hasMany(User, {
        as: 'FKUserDepartments',
        foreignKey: 'ReportingDepartment',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.hasMany(UserDepartment, {
        as: 'FKUserdepartmentDepartments',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(FitsChangeDriverSet, {
        as: 'DepartmentFitsChangeDriverSetFitsChangeDriverSets',
        through: DepartmentFitsChangeDriverSet,
        foreignKey: 'DepartmentID',
        otherKey: 'FitsChangeDriverSetID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(JobType, {
        as: 'JobTypeDepartmentJobTypes',
        through: JobTypeDepartment,
        foreignKey: 'DepartmentID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(Role, {
        as: 'JobTypeDepartmentRoles',
        through: JobTypeDepartment,
        foreignKey: 'DepartmentID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(JobType, {
        as: 'JobTypeUserQAJobTypes',
        through: JobTypeUserQA,
        foreignKey: 'DepartmentID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(QAType, {
        as: 'JobTypeUserQAQATypes',
        through: JobTypeUserQA,
        foreignKey: 'DepartmentID',
        otherKey: 'QATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(User, {
        as: 'JobTypeUserQAUsers',
        through: JobTypeUserQA,
        foreignKey: 'DepartmentID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(JobType, {
        as: 'QADepartmentJobTypeJobTypes',
        through: QADepartmentJobType,
        foreignKey: 'DepartmentID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(RowStatusType, {
        as: 'UserRowStatusTypes',
        through: User,
        foreignKey: 'ReportingDepartment',
        otherKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(Role, {
        as: 'UserDepartmentRoles',
        through: UserDepartment,
        foreignKey: 'DepartmentID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Department.belongsToMany(User, {
        as: 'UserDepartmentUsers',
        through: UserDepartment,
        foreignKey: 'DepartmentID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
