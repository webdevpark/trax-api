'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CommunicationEntity', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        communicationID: {
            type: DataTypes.INTEGER,
            field: 'CommunicationID',
            allowNull: false,
            references: {
                model: 'Communication',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        entityTypeID: {
            type: DataTypes.INTEGER,
            field: 'EntityTypeID',
            allowNull: false,
            references: {
                model: 'CommunicationEntityType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        value: {
            type: DataTypes.STRING(1000),
            field: 'Value',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'CommunicationEntity',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CommunicationEntity = model.CommunicationEntity;
    var Communication = model.Communication;
    var CommunicationEntityType = model.CommunicationEntityType;

    CommunicationEntity.belongsTo(Communication, {
        as: 'Communication',
        foreignKey: 'CommunicationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CommunicationEntity.belongsTo(CommunicationEntityType, {
        as: 'EntityType',
        foreignKey: 'EntityTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
