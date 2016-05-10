'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('ActivityEventTypeDump', {
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
        mongoSymbol: {
            type: DataTypes.STRING(20),
            field: 'MongoSymbol',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'ActivityEventTypeDump',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var ActivityEventTypeDump = model.ActivityEventTypeDump;

};
