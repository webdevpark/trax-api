'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CommunicationType', {
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
        tableName: 'CommunicationType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CommunicationType = model.CommunicationType;
    var Communication = model.Communication;
    var CommunicationPriority = model.CommunicationPriority;
    var TimeZone = model.TimeZone;

    CommunicationType.hasMany(Communication, {
        as: 'FKCommunicationCommunicationtypes',
        foreignKey: 'CommunicationTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CommunicationType.belongsToMany(CommunicationPriority, {
        as: 'CommunicationPriorities',
        through: Communication,
        foreignKey: 'CommunicationTypeID',
        otherKey: 'PriorityID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CommunicationType.belongsToMany(TimeZone, {
        as: 'CommunicationTimeZones',
        through: Communication,
        foreignKey: 'CommunicationTypeID',
        otherKey: 'TimeZoneID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
