'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Stage', {
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
        }
    }, {
        schema: 'public',
        tableName: 'Stage',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var Stage = model.Stage;
    var JobTypeStage = model.JobTypeStage;
    var JobType = model.JobType;

    Stage.hasMany(JobTypeStage, {
        as: 'FKJobtypestageStages',
        foreignKey: 'StageID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Stage.belongsToMany(JobType, {
        as: 'JobTypeStageJobTypes',
        through: JobTypeStage,
        foreignKey: 'StageID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
