'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('JobTypeTrait', {
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
        traitID: {
            type: DataTypes.INTEGER,
            field: 'TraitID',
            allowNull: false,
            references: {
                model: 'Trait',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        }
    }, {
        schema: 'public',
        tableName: 'JobTypeTrait',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var JobTypeTrait = model.JobTypeTrait;
    var JobType = model.JobType;
    var Trait = model.Trait;

    JobTypeTrait.belongsTo(JobType, {
        as: 'JobType',
        foreignKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    JobTypeTrait.belongsTo(Trait, {
        as: 'Trait',
        foreignKey: 'TraitID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
