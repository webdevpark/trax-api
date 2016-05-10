'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Office', {
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
        }
    }, {
        schema: 'public',
        tableName: 'Office',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var Office = model.Office;
    var JobTypeOffice = model.JobTypeOffice;
    var UserOffice = model.UserOffice;
    var JobType = model.JobType;
    var Role = model.Role;
    var User = model.User;

    Office.hasMany(JobTypeOffice, {
        as: 'FKJobtypeofficeOffices',
        foreignKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Office.hasMany(UserOffice, {
        as: 'FKUserofficeOffices',
        foreignKey: 'OfficeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Office.belongsToMany(JobType, {
        as: 'JobTypeOfficeJobTypes',
        through: JobTypeOffice,
        foreignKey: 'OfficeID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Office.belongsToMany(Role, {
        as: 'JobTypeOfficeRoles',
        through: JobTypeOffice,
        foreignKey: 'OfficeID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Office.belongsToMany(Role, {
        as: 'UserOfficeRoles',
        through: UserOffice,
        foreignKey: 'OfficeID',
        otherKey: 'RoleID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Office.belongsToMany(User, {
        as: 'UserOfficeUsers',
        through: UserOffice,
        foreignKey: 'OfficeID',
        otherKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
