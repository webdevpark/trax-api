'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeDepartmentFilter', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        jobTypeDepartmentID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeDepartmentID',
            allowNull: false,
            references: {
                model: 'JobTypeDepartment',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        attribute: {
            type: DataTypes.STRING(250),
            field: 'Attribute',
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(1024),
            field: 'Value',
            allowNull: false
        },
        filterOperatorID: {
            type: DataTypes.INTEGER,
            field: 'FilterOperatorID',
            allowNull: false,
            references: {
                model: 'FilterOperator',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeDepartmentFilter',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeDepartmentFilter = model.JobTypeDepartmentFilter;
    var FilterOperator = model.FilterOperator;
    var JobTypeDepartment = model.JobTypeDepartment;

    JobTypeDepartmentFilter.belongsTo(FilterOperator, {
        as: 'FilterOperator',
        foreignKey: 'FilterOperatorID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeDepartmentFilter.belongsTo(JobTypeDepartment, {
        as: 'JobTypeDepartment',
        foreignKey: 'JobTypeDepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
