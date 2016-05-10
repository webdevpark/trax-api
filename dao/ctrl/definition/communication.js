'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Communication', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        communicationTypeID: {
            type: DataTypes.INTEGER,
            field: 'CommunicationTypeID',
            allowNull: false,
            references: {
                model: 'CommunicationType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        priorityID: {
            type: DataTypes.INTEGER,
            field: 'PriorityID',
            allowNull: true,
            references: {
                model: 'CommunicationPriority',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        timeZoneID: {
            type: DataTypes.INTEGER,
            field: 'TimeZoneID',
            allowNull: true,
            references: {
                model: 'TimeZone',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        isHtml: {
            type: DataTypes.BOOLEAN,
            field: 'IsHtml',
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(1000),
            field: 'Title',
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            field: 'Message',
            allowNull: false
        },
        created: {
            type: DataTypes.DATE,
            field: 'Created',
            allowNull: false
        },
        sent: {
            type: DataTypes.DATE,
            field: 'Sent',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'Communication',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var Communication = model.Communication;
    var CommunicationEntity = model.CommunicationEntity;
    var CommunicationPriority = model.CommunicationPriority;
    var CommunicationType = model.CommunicationType;
    var TimeZone = model.TimeZone;
    var CommunicationEntityType = model.CommunicationEntityType;

    Communication.hasMany(CommunicationEntity, {
        as: 'FKCommunicationentityCommunications',
        foreignKey: 'CommunicationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Communication.belongsTo(CommunicationPriority, {
        as: 'Priority',
        foreignKey: 'PriorityID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Communication.belongsTo(CommunicationType, {
        as: 'CommunicationType',
        foreignKey: 'CommunicationTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Communication.belongsTo(TimeZone, {
        as: 'TimeZone',
        foreignKey: 'TimeZoneID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Communication.belongsToMany(CommunicationEntityType, {
        as: 'CommunicationEntityEntityTypes',
        through: CommunicationEntity,
        foreignKey: 'CommunicationID',
        otherKey: 'EntityTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
