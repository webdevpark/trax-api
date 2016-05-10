'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TraxWaitingRoomCall', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        traxWaitingRoomID: {
            type: DataTypes.INTEGER,
            field: 'TraxWaitingRoomID',
            allowNull: false,
            references: {
                model: 'TraxWaitingRoom',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        phoneNumber: {
            type: DataTypes.STRING(50),
            field: 'PhoneNumber',
            allowNull: true
        },
        latestCallDate: {
            type: DataTypes.DATE,
            field: 'LatestCallDate',
            allowNull: true
        },
        isContactable: {
            type: DataTypes.BOOLEAN,
            field: 'IsContactable',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'TraxWaitingRoomCall',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TraxWaitingRoomCall = model.TraxWaitingRoomCall;
    var TraxWaitingRoom = model.TraxWaitingRoom;

    TraxWaitingRoomCall.belongsTo(TraxWaitingRoom, {
        as: 'TraxWaitingRoom',
        foreignKey: 'TraxWaitingRoomID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
