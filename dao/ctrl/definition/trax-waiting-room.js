'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TraxWaitingRoom', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        created: {
            type: DataTypes.DATE,
            field: 'Created',
            allowNull: true
        },
        jobTypeID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeID',
            allowNull: false,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        traxSerial: {
            type: DataTypes.STRING(32),
            field: 'TraxSerial',
            allowNull: true
        },
        cRMActivityGUID: {
            type: DataTypes.UUID,
            field: 'CRMActivityGUID',
            allowNull: true
        },
        cRMAccountGUID: {
            type: DataTypes.UUID,
            field: 'CRMAccountGUID',
            allowNull: true
        },
        cRMContactGUID: {
            type: DataTypes.UUID,
            field: 'CRMContactGUID',
            allowNull: true
        },
        cRMCallerGUID: {
            type: DataTypes.UUID,
            field: 'CRMCallerGUID',
            allowNull: true
        },
        leadID: {
            type: DataTypes.INTEGER,
            field: 'LeadID',
            allowNull: true
        },
        tontoApplicationID: {
            type: DataTypes.INTEGER,
            field: 'TontoApplicationID',
            allowNull: true
        },
        deferredUntil: {
            type: DataTypes.DATE,
            field: 'DeferredUntil',
            allowNull: true
        },
        traxJobCreated: {
            type: DataTypes.DATE,
            field: 'TraxJobCreated',
            allowNull: true
        },
        cRMCampaignName: {
            type: DataTypes.STRING(500),
            field: 'CRMCampaignName',
            allowNull: true
        },
        cRMCampaignGUID: {
            type: DataTypes.UUID,
            field: 'CRMCampaignGUID',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'TraxWaitingRoom',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TraxWaitingRoom = model.TraxWaitingRoom;
    var TraxWaitingRoomCall = model.TraxWaitingRoomCall;
    var JobType = model.JobType;

    TraxWaitingRoom.hasMany(TraxWaitingRoomCall, {
        as: 'FKTraxwaitingroomcallTraxwaitingrooms',
        foreignKey: 'TraxWaitingRoomID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    TraxWaitingRoom.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
