'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobStatusPartition', {
        traxSerial: {
            type: DataTypes.CHAR(24),
            field: 'TraxSerial',
            allowNull: false,
            references: {
                model: 'JobStatus',
                key: 'TraxSerial'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        name: {
            type: DataTypes.STRING(50),
            field: 'Name',
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(250),
            field: 'Value',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'JobStatusPartition',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobStatusPartition = model.JobStatusPartition;
    var JobStatus = model.JobStatus;

    JobStatusPartition.belongsTo(JobStatus, {
        as: 'RelatedTraxserial',
        foreignKey: 'TraxSerial',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
