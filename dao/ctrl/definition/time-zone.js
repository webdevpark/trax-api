'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TimeZone', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(250),
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
        tableName: 'TimeZone',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TimeZone = model.TimeZone;
    var Communication = model.Communication;
    var CommunicationPriority = model.CommunicationPriority;
    var CommunicationType = model.CommunicationType;

    TimeZone.hasMany(Communication, {
        as: 'FKCommunicationTimezones',
        foreignKey: 'TimeZoneID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TimeZone.belongsToMany(CommunicationPriority, {
        as: 'CommunicationPriorities',
        through: Communication,
        foreignKey: 'TimeZoneID',
        otherKey: 'PriorityID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TimeZone.belongsToMany(CommunicationType, {
        as: 'CommunicationCommunicationTypes',
        through: Communication,
        foreignKey: 'TimeZoneID',
        otherKey: 'CommunicationTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
