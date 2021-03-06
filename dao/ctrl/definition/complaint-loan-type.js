'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('ComplaintLoanType', {
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
        active: {
            type: DataTypes.BOOLEAN,
            field: 'Active',
            allowNull: true,
            defaultValue: true
        }
    }, {
        schema: 'public',
        tableName: 'ComplaintLoanType',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var ComplaintLoanType = model.ComplaintLoanType;

};
