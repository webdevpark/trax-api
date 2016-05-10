'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('QAType', {
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
        numSamples: {
            type: DataTypes.INTEGER,
            field: 'NumSamples',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'QAType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var QAType = model.QAType;
    var JobTypeUserQA = model.JobTypeUserQA;
    var Department = model.Department;
    var JobType = model.JobType;
    var User = model.User;

    QAType.hasMany(JobTypeUserQA, {
        as: 'FKJobtypeuserqaQatypes',
        foreignKey: 'QATypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    QAType.belongsToMany(Department, {
        as: 'JobTypeUserQADepartments',
        through: JobTypeUserQA,
        foreignKey: 'QATypeID',
        otherKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    QAType.belongsToMany(JobType, {
        as: 'JobTypeUserQAJobTypes',
        through: JobTypeUserQA,
        foreignKey: 'QATypeID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    QAType.belongsToMany(User, {
        as: 'JobTypeUserQAUsers',
        through: JobTypeUserQA,
        foreignKey: 'QATypeID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
