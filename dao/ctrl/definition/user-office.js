'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserOffice', {
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
        officeID: {
            type: DataTypes.INTEGER,
            field: 'OfficeID',
            allowNull: false,
            references: {
                model: 'Office',
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
        tableName: 'UserOffice',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var UserOffice = model.UserOffice;
    var Office = model.Office;
    var Role = model.Role;
    var User = model.User;

    UserOffice.belongsTo(Office, {
        as: 'Office',
        foreignKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    UserOffice.belongsTo(Role, {
        as: 'Role',
        foreignKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    UserOffice.belongsTo(User, {
        as: 'User',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
