'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('LmtcConfigurationType', {
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
        description: {
            type: DataTypes.STRING(500),
            field: 'Description',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'LmtcConfigurationType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var LmtcConfigurationType = model.LmtcConfigurationType;
    var LmtcConfiguration = model.LmtcConfiguration;

    LmtcConfigurationType.hasMany(LmtcConfiguration, {
        as: 'FKLmtcconfigurationLmtcconfigurationtypes',
        foreignKey: 'LmtcConfigurationTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
