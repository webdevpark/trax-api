'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CommunicationEntityType', {
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
        tableName: 'CommunicationEntityType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CommunicationEntityType = model.CommunicationEntityType;
    var CommunicationEntity = model.CommunicationEntity;
    var Communication = model.Communication;

    CommunicationEntityType.hasMany(CommunicationEntity, {
        as: 'FKCommunicationentityCommunicationentitytypes',
        foreignKey: 'EntityTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    CommunicationEntityType.belongsToMany(Communication, {
        as: 'CommunicationEntityCommunications',
        through: CommunicationEntity,
        foreignKey: 'EntityTypeID',
        otherKey: 'CommunicationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
