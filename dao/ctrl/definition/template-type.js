'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('TemplateType', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        templateCategoryID: {
            type: DataTypes.INTEGER,
            field: 'TemplateCategoryID',
            allowNull: false,
            references: {
                model: 'TemplateCategory',
                key: 'ID'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        description: {
            type: DataTypes.STRING(100),
            field: 'Description',
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: false
        }
    }, {
        schema: 'public',
        tableName: 'TemplateType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var TemplateType = model.TemplateType;
    var TemplateCategory = model.TemplateCategory;

    TemplateType.belongsTo(TemplateCategory, {
        as: 'TemplateCategory',
        foreignKey: 'TemplateCategoryID',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    });

};
