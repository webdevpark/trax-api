'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserDepartment', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
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
        tableName: 'UserDepartment',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var UserDepartment = model.UserDepartment;
    var Department = model.Department;
    var Role = model.Role;
    var User = model.User;

    UserDepartment.belongsTo(Department, {
        as: 'Department',
        foreignKey: 'DepartmentID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    UserDepartment.belongsTo(Role, {
        as: 'Role',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    UserDepartment.belongsTo(User, {
        as: 'User',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
