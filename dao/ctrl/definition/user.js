'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        fullName: {
            type: DataTypes.STRING(100),
            field: 'FullName',
            allowNull: false
        },
        emailAddress: {
            type: DataTypes.STRING(100),
            field: 'EmailAddress',
            allowNull: true
        },
        tontoUserID: {
            type: DataTypes.INTEGER,
            field: 'TontoUserID',
            allowNull: true
        },
        partyRoleID: {
            type: DataTypes.INTEGER,
            field: 'PartyRoleID',
            allowNull: true
        },
        rowStatusTypeID: {
            type: DataTypes.INTEGER,
            field: 'RowStatusTypeID',
            allowNull: false,
            references: {
                model: 'RowStatusType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        objectSID: {
            type: DataTypes.STRING(100),
            field: 'ObjectSID',
            allowNull: true
        },
        phoneExtension: {
            type: DataTypes.STRING(10),
            field: 'PhoneExtension',
            allowNull: true
        },
        auto: {
            type: DataTypes.BOOLEAN,
            field: 'Auto',
            allowNull: false,
            defaultValue: false
        },
        cRMGuid: {
            type: DataTypes.UUID,
            field: 'CRMGuid',
            allowNull: true
        },
        ignoreAssignedUntil: {
            type: DataTypes.DATE,
            field: 'IgnoreAssignedUntil',
            allowNull: true
        },
        reportingDepartment: {
            type: DataTypes.INTEGER,
            field: 'ReportingDepartment',
            allowNull: true,
            references: {
                model: 'Department',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'User',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var User = model.User;
    var JobLock = model.JobLock;
    var JobStatus = model.JobStatus;
    var JobTypeUserQA = model.JobTypeUserQA;
    var News = model.News;
    var TraxUserWorkTimeDetail = model.TraxUserWorkTimeDetail;
    var UserDepartment = model.UserDepartment;
    var UserOffice = model.UserOffice;
    var Department = model.Department;
    var RowStatusType = model.RowStatusType;
    var JobType = model.JobType;
    var QAType = model.QAType;
    var Role = model.Role;
    var Office = model.Office;

    User.hasMany(JobLock, {
        as: 'FKJoblockUsers',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.hasMany(JobStatus, {
        as: 'FKJobstatusUsers',
        foreignKey: 'AssignedUserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.hasMany(JobTypeUserQA, {
        as: 'FKJobtypeuserqaUsers',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.hasMany(News, {
        as: 'FKNewsUsers',
        foreignKey: 'CreatedByID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.hasMany(TraxUserWorkTimeDetail, {
        as: 'FKTraxuserIds',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.hasMany(UserDepartment, {
        as: 'FKUserdepartmentUsers',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.hasMany(UserOffice, {
        as: 'FKUserofficeUsers',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsTo(Department, {
        as: 'RelatedReportingdepartment',
        foreignKey: 'ReportingDepartment',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsTo(RowStatusType, {
        as: 'RowStatusType',
        foreignKey: 'RowStatusTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(JobType, {
        as: 'JobStatusJobTypes',
        through: JobStatus,
        foreignKey: 'AssignedUserID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(Department, {
        as: 'JobTypeUserQADepartments',
        through: JobTypeUserQA,
        foreignKey: 'UserID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(JobType, {
        as: 'JobTypeUserQAJobTypes',
        through: JobTypeUserQA,
        foreignKey: 'UserID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(QAType, {
        as: 'JobTypeUserQAQATypes',
        through: JobTypeUserQA,
        foreignKey: 'UserID',
        otherKey: 'QATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(Department, {
        as: 'UserDepartmentDepartments',
        through: UserDepartment,
        foreignKey: 'UserID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(Role, {
        as: 'UserDepartmentRoles',
        through: UserDepartment,
        foreignKey: 'UserID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(Office, {
        as: 'UserOfficeOffices',
        through: UserOffice,
        foreignKey: 'UserID',
        otherKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    User.belongsToMany(Role, {
        as: 'UserOfficeRoles',
        through: UserOffice,
        foreignKey: 'UserID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
