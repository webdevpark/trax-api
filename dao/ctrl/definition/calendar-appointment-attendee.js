'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CalendarAppointmentAttendee', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        calendarItemId: {
            type: DataTypes.STRING(156),
            field: 'CalendarItemId',
            allowNull: true
        },
        calendarChangeKey: {
            type: DataTypes.STRING(100),
            field: 'CalendarChangeKey',
            allowNull: true
        },
        attendeeName: {
            type: DataTypes.STRING(100),
            field: 'AttendeeName',
            allowNull: true
        },
        attendeeEMailAddr: {
            type: DataTypes.STRING(100),
            field: 'AttendeeEMailAddr',
            allowNull: true
        },
        attendeeResponse: {
            type: DataTypes.STRING(20),
            field: 'AttendeeResponse',
            allowNull: true
        },
        inviteeType: {
            type: DataTypes.STRING(20),
            field: 'InviteeType',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'CalendarAppointmentAttendee',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CalendarAppointmentAttendee = model.CalendarAppointmentAttendee;

};
