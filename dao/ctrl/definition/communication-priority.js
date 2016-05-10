'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CommunicationPriority', {
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
        tableName: 'CommunicationPriority',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CommunicationPriority = model.CommunicationPriority;
    var Communication = model.Communication;
    var CommunicationType = model.CommunicationType;
    var TimeZone = model.TimeZone;

    CommunicationPriority.hasMany(Communication, {
        as: 'FKCommunicationCommunicationpriorities',
        foreignKey: 'PriorityID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CommunicationPriority.belongsToMany(CommunicationType, {
        as: 'CommunicationCommunicationTypes',
        through: Communication,
        foreignKey: 'PriorityID',
        otherKey: 'CommunicationTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CommunicationPriority.belongsToMany(TimeZone, {
        as: 'CommunicationTimeZones',
        through: Communication,
        foreignKey: 'PriorityID',
        otherKey: 'TimeZoneID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
