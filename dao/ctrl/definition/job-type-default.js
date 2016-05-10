'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeDefault', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
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
        description: {
            type: DataTypes.STRING(500),
            field: 'Description',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeDefault',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeDefault = model.JobTypeDefault;
    var JobType = model.JobType;

    JobTypeDefault.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
