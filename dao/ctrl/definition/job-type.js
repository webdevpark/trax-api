'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobType', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        typeCode: {
            type: DataTypes.STRING(25),
            field: 'TypeCode',
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(100),
            field: 'Description',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        },
        auto: {
            type: DataTypes.BOOLEAN,
            field: 'Auto',
            allowNull: false,
            defaultValue: false
        },
        viewTemplate: {
            type: DataTypes.STRING(50),
            field: 'ViewTemplate',
            allowNull: true
        },
        listTemplate: {
            type: DataTypes.STRING(50),
            field: 'ListTemplate',
            allowNull: true
        },
        toolbarTemplate: {
            type: DataTypes.STRING(50),
            field: 'ToolbarTemplate',
            allowNull: true
        },
        modelType: {
            type: DataTypes.STRING(250),
            field: 'ModelType',
            allowNull: true
        },
        viewModelType: {
            type: DataTypes.STRING(250),
            field: 'ViewModelType',
            allowNull: true
        },
        wrapUpTemplateID: {
            type: DataTypes.INTEGER,
            field: 'WrapUpTemplateID',
            allowNull: true,
            references: {
                model: 'WrapUpTemplate',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        neverIgnore: {
            type: DataTypes.BOOLEAN,
            field: 'NeverIgnore',
            allowNull: true
        },
        sLAID: {
            type: DataTypes.INTEGER,
            field: 'SLAID',
            allowNull: true
        },
        workTime: {
            type: DataTypes.INTEGER,
            field: 'WorkTime',
            allowNull: true
        },
        talkTime: {
            type: DataTypes.INTEGER,
            field: 'TalkTime',
            allowNull: true
        },
        createViewTemplate: {
            type: DataTypes.STRING(50),
            field: 'CreateViewTemplate',
            allowNull: true
        },
        interruptable: {
            type: DataTypes.BOOLEAN,
            field: 'Interruptable',
            allowNull: true
        },
        checkListID: {
            type: DataTypes.INTEGER,
            field: 'CheckListID',
            allowNull: true,
            references: {
                model: 'CheckList',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'JobType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobType = model.JobType;
    var AppointmentClientConfiguration = model.AppointmentClientConfiguration;
    var JobStatus = model.JobStatus;
    var JobTypeDefault = model.JobTypeDefault;
    var JobTypeDepartment = model.JobTypeDepartment;
    var JobTypeFollowUp = model.JobTypeFollowUp;
    var JobTypeGate = model.JobTypeGate;
    var JobTypeOffice = model.JobTypeOffice;
    var JobTypeReasonableExpectancy = model.JobTypeReasonableExpectancy;
    var JobTypeStage = model.JobTypeStage;
    var JobTypeTrait = model.JobTypeTrait;
    var JobTypeTriggerPoint = model.JobTypeTriggerPoint;
    var JobTypeUserQA = model.JobTypeUserQA;
    var LmtcHoldConfiguration = model.LmtcHoldConfiguration;
    var QADepartmentJobType = model.QADepartmentJobType;
    var TraxWaitingRoom = model.TraxWaitingRoom;
    var CheckList = model.CheckList;
    var WrapUpTemplate = model.WrapUpTemplate;
    var Role = model.Role;
    var User = model.User;
    var Department = model.Department;
    var Office = model.Office;
    var Stage = model.Stage;
    var Trait = model.Trait;
    var TriggerPoint = model.TriggerPoint;
    var QAType = model.QAType;
    var WrapUpValue = model.WrapUpValue;
    var LmtcConfiguration = model.LmtcConfiguration;

    JobType.hasMany(AppointmentClientConfiguration, {
        as: 'FKAppointmenttypeJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobStatus, {
        as: 'FKJobstatusJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeDefault, {
        as: 'FKJobtypedefaultJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeDepartment, {
        as: 'FKJobtypedepartmentJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeFollowUp, {
        as: 'FKJobtypefollowupJobtypecompleteds',
        foreignKey: 'CompletedJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeFollowUp, {
        as: 'FKJobtypefollowupJobtypenews',
        foreignKey: 'NewJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeGate, {
        as: 'FKJobtypegateJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeOffice, {
        as: 'FKJobtypeofficeJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeReasonableExpectancy, {
        as: 'FKJobtypeIds',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeStage, {
        as: 'FKJobtypestageJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeTrait, {
        as: 'FKJobtypetraitJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeTriggerPoint, {
        as: 'FKJobtypetriggerpointJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(JobTypeUserQA, {
        as: 'FKJobtypeuserqaJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(LmtcHoldConfiguration, {
        as: 'FKLmtcconfigurationJobtypes',
        foreignKey: 'NextJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(QADepartmentJobType, {
        as: 'FKQadepartmentjobtypeJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.hasMany(TraxWaitingRoom, {
        as: 'FKTraxwaitingroomJobtypes',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsTo(CheckList, {
        as: 'CheckList',
        foreignKey: 'CheckListID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsTo(WrapUpTemplate, {
        as: 'WrapUpTemplate',
        foreignKey: 'WrapUpTemplateID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Role, {
        as: 'AppointmentClientConfigurationRoles',
        through: AppointmentClientConfiguration,
        foreignKey: 'JobTypeID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(User, {
        as: 'JobStatusAssignedUsers',
        through: JobStatus,
        foreignKey: 'JobTypeID',
        otherKey: 'AssignedUserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Department, {
        as: 'JobTypeDepartmentDepartments',
        through: JobTypeDepartment,
        foreignKey: 'JobTypeID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Role, {
        as: 'JobTypeDepartmentRoles',
        through: JobTypeDepartment,
        foreignKey: 'JobTypeID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(JobType, {
        as: 'JobTypeFollowUpNewJobTypes',
        through: JobTypeFollowUp,
        foreignKey: 'CompletedJobTypeID',
        otherKey: 'NewJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(JobType, {
        as: 'JobTypeFollowUpCompletedJobTypes',
        through: JobTypeFollowUp,
        foreignKey: 'NewJobTypeID',
        otherKey: 'CompletedJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Role, {
        as: 'JobTypeGateRoles',
        through: JobTypeGate,
        foreignKey: 'JobTypeID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Office, {
        as: 'JobTypeOfficeOffices',
        through: JobTypeOffice,
        foreignKey: 'JobTypeID',
        otherKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Role, {
        as: 'JobTypeOfficeRoles',
        through: JobTypeOffice,
        foreignKey: 'JobTypeID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Stage, {
        as: 'JobTypeStageStages',
        through: JobTypeStage,
        foreignKey: 'JobTypeID',
        otherKey: 'StageID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Trait, {
        as: 'JobTypeTraitTraits',
        through: JobTypeTrait,
        foreignKey: 'JobTypeID',
        otherKey: 'TraitID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(TriggerPoint, {
        as: 'JobTypeTriggerPointTriggerPoints',
        through: JobTypeTriggerPoint,
        foreignKey: 'JobTypeID',
        otherKey: 'TriggerPointID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Department, {
        as: 'JobTypeUserQADepartments',
        through: JobTypeUserQA,
        foreignKey: 'JobTypeID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(QAType, {
        as: 'JobTypeUserQAQATypes',
        through: JobTypeUserQA,
        foreignKey: 'JobTypeID',
        otherKey: 'QATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(User, {
        as: 'JobTypeUserQAUsers',
        through: JobTypeUserQA,
        foreignKey: 'JobTypeID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(WrapUpValue, {
        as: 'LmtcHoldConfigurationWrapUpValues',
        through: LmtcHoldConfiguration,
        foreignKey: 'NextJobTypeID',
        otherKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(LmtcConfiguration, {
        as: 'LmtcHoldConfigurationLmtcConfigurations',
        through: LmtcHoldConfiguration,
        foreignKey: 'NextJobTypeID',
        otherKey: 'LmtcConfigurationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobType.belongsToMany(Department, {
        as: 'QADepartmentJobTypeDepartments',
        through: QADepartmentJobType,
        foreignKey: 'JobTypeID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
