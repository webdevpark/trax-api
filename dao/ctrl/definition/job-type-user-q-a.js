'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeUserQA', {
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
        userID: {
            type: DataTypes.INTEGER,
            field: 'UserID',
            allowNull: false,
            references: {
                model: 'User',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        qATypeID: {
            type: DataTypes.INTEGER,
            field: 'QATypeID',
            allowNull: false,
            references: {
                model: 'QAType',
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
        tableName: 'JobTypeUserQA',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeUserQA = model.JobTypeUserQA;
    var Department = model.Department;
    var JobType = model.JobType;
    var QAType = model.QAType;
    var User = model.User;

    JobTypeUserQA.belongsTo(Department, {
        as: 'Department',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeUserQA.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeUserQA.belongsTo(QAType, {
        as: 'QAType',
        foreignKey: 'QATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeUserQA.belongsTo(User, {
        as: 'User',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
