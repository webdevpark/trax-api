'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeStage', {
        jobTypeID: {
            type: DataTypes.INTEGER,
            field: 'JobTypeID',
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'JobType',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        stageID: {
            type: DataTypes.INTEGER,
            field: 'StageID',
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Stage',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeStage',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeStage = model.JobTypeStage;
    var JobType = model.JobType;
    var Stage = model.Stage;

    JobTypeStage.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeStage.belongsTo(Stage, {
        as: 'Stage',
        foreignKey: 'StageID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
