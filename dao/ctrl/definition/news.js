'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('News', {
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
            allowNull: false
        },
        createdByID: {
            type: DataTypes.INTEGER,
            field: 'CreatedByID',
            allowNull: false,
            references: {
                model: 'User',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        title: {
            type: DataTypes.STRING(256),
            field: 'Title',
            allowNull: false
        },
        body: {
            type: DataTypes.TEXT,
            field: 'Body',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'News',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var News = model.News;
    var User = model.User;

    News.belongsTo(User, {
        as: 'CreatedBy',
        foreignKey: 'CreatedByID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
