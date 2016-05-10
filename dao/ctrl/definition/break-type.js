'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('BreakType', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING(50),
            field: 'Description',
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            field: 'Duration',
            allowNull: true
        },
        eventTypeID: {
            type: DataTypes.INTEGER,
            field: 'EventTypeID',
            allowNull: false,
            references: {
                model: 'EventType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'BreakType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var BreakType = model.BreakType;
    var EventType = model.EventType;

    BreakType.belongsTo(EventType, {
        as: 'EventType',
        foreignKey: 'EventTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
