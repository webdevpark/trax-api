'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Trait', {
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
        description: {
            type: DataTypes.STRING(500),
            field: 'Description',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'Trait',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var Trait = model.Trait;
    var JobTypeTrait = model.JobTypeTrait;
    var JobType = model.JobType;

    Trait.hasMany(JobTypeTrait, {
        as: 'FKJobtypetraitTraits',
        foreignKey: 'TraitID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

    Trait.belongsToMany(JobType, {
        as: 'JobTypeTraitJobTypes',
        through: JobTypeTrait,
        foreignKey: 'TraitID',
        otherKey: 'JobTypeID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
