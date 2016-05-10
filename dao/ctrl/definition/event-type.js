'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('EventType', {
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
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'IsActive',
            allowNull: false,
            defaultValue: false
        },
        interruptable: {
            type: DataTypes.BOOLEAN,
            field: 'Interruptable',
            allowNull: false,
            defaultValue: true
        }
    }, {
        schema: 'public',
        tableName: 'EventType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var EventType = model.EventType;
    var BreakType = model.BreakType;

    EventType.hasMany(BreakType, {
        as: 'FKBreaktypeEventtypes',
        foreignKey: 'EventTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
