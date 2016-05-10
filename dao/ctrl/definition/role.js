'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Role', {
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
        aDName: {
            type: DataTypes.STRING(256),
            field: 'ADName',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'Role',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var Role = model.Role;
    var AppointmentClientConfiguration = model.AppointmentClientConfiguration;
    var JobTypeDepartment = model.JobTypeDepartment;
    var JobTypeGate = model.JobTypeGate;
    var JobTypeOffice = model.JobTypeOffice;
    var UserDepartment = model.UserDepartment;
    var UserOffice = model.UserOffice;
    var JobType = model.JobType;
    var Department = model.Department;
    var Office = model.Office;
    var User = model.User;

    Role.hasMany(AppointmentClientConfiguration, {
        as: 'FKAppointmenttypeRoles',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.hasMany(JobTypeDepartment, {
        as: 'FKJobtypedepartmentRoles',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.hasMany(JobTypeGate, {
        as: 'FKJobtypegateRoles',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.hasMany(JobTypeOffice, {
        as: 'FKJobtypeofficeRoles',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.hasMany(UserDepartment, {
        as: 'FKUserdepartmentRoles',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.hasMany(UserOffice, {
        as: 'FKUserofficeRoles',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(JobType, {
        as: 'AppointmentClientConfigurationJobTypes',
        through: AppointmentClientConfiguration,
        foreignKey: 'RoleID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(Department, {
        as: 'JobTypeDepartmentDepartments',
        through: JobTypeDepartment,
        foreignKey: 'RoleID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(JobType, {
        as: 'JobTypeDepartmentJobTypes',
        through: JobTypeDepartment,
        foreignKey: 'RoleID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(JobType, {
        as: 'JobTypeGateJobTypes',
        through: JobTypeGate,
        foreignKey: 'RoleID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(JobType, {
        as: 'JobTypeOfficeJobTypes',
        through: JobTypeOffice,
        foreignKey: 'RoleID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(Office, {
        as: 'JobTypeOfficeOffices',
        through: JobTypeOffice,
        foreignKey: 'RoleID',
        otherKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(Department, {
        as: 'UserDepartmentDepartments',
        through: UserDepartment,
        foreignKey: 'RoleID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(User, {
        as: 'UserDepartmentUsers',
        through: UserDepartment,
        foreignKey: 'RoleID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(Office, {
        as: 'UserOfficeOffices',
        through: UserOffice,
        foreignKey: 'RoleID',
        otherKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Role.belongsToMany(User, {
        as: 'UserOfficeUsers',
        through: UserOffice,
        foreignKey: 'RoleID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
