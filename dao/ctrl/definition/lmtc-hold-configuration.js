'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('LmtcHoldConfiguration', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        lmtcConfigurationID: {
            type: DataTypes.INTEGER,
            field: 'LmtcConfigurationID',
            allowNull: false,
            references: {
                model: 'LmtcConfiguration',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        numAttempts: {
            type: DataTypes.INTEGER,
            field: 'NumAttempts',
            allowNull: false
        },
        holdDurationMins: {
            type: DataTypes.INTEGER,
            field: 'HoldDurationMins',
            allowNull: false
        },
        salesStatusTypeID: {
            type: DataTypes.INTEGER,
            field: 'SalesStatusTypeID',
            allowNull: true
        },
        wrapUpValueID: {
            type: DataTypes.INTEGER,
            field: 'WrapUpValueID',
            allowNull: true,
            references: {
                model: 'WrapUpValue',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        nextJobTypeID: {
            type: DataTypes.INTEGER,
            field: 'NextJobTypeID',
            allowNull: true,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        completeJob: {
            type: DataTypes.BOOLEAN,
            field: 'CompleteJob',
            allowNull: true
        },
        crash: {
            type: DataTypes.BOOLEAN,
            field: 'Crash',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'LmtcHoldConfiguration',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var LmtcHoldConfiguration = model.LmtcHoldConfiguration;
    var JobType = model.JobType;
    var WrapUpValue = model.WrapUpValue;
    var LmtcConfiguration = model.LmtcConfiguration;

    LmtcHoldConfiguration.belongsTo(JobType, {
        as: 'NextJobType',
        foreignKey: 'NextJobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    LmtcHoldConfiguration.belongsTo(WrapUpValue, {
        as: 'WrapUpValue',
        foreignKey: 'WrapUpValueID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    LmtcHoldConfiguration.belongsTo(LmtcConfiguration, {
        as: 'LmtcConfiguration',
        foreignKey: 'LmtcConfigurationID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
