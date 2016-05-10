'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobLock', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        serial: {
            type: DataTypes.CHAR(24),
            field: 'Serial',
            allowNull: false
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
        acquired: {
            type: DataTypes.DATE,
            field: 'Acquired',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'JobLock',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobLock = model.JobLock;
    var User = model.User;

    JobLock.belongsTo(User, {
        as: 'User',
        foreignKey: 'UserID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
