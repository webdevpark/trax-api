'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('CalendarAppointment', {
        iD: {
            type: DataTypes.INTEGER,
            field: 'ID',
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        leadID: {
            type: DataTypes.INTEGER,
            field: 'LeadID',
            allowNull: true
        },
        traxSerial: {
            type: DataTypes.STRING(32),
            field: 'TraxSerial',
            allowNull: true
        },
        itemId: {
            type: DataTypes.STRING(156),
            field: 'ItemId',
            allowNull: true
        },
        itemChangeKey: {
            type: DataTypes.STRING(100),
            field: 'ItemChangeKey',
            allowNull: true
        },
        class: {
            type: DataTypes.STRING(100),
                field: 'Class',
                allowNull: true
        },
        subject: {
            type: DataTypes.STRING(512),
            field: 'Subject',
            allowNull: true
        },
        sensitivity: {
            type: DataTypes.STRING(10),
            field: 'Sensitivity',
            allowNull: true
        },
        received: {
            type: DataTypes.DATE,
            field: 'Received',
            allowNull: true
        },
        sent: {
            type: DataTypes.DATE,
            field: 'Sent',
            allowNull: true
        },
        created: {
            type: DataTypes.DATE,
            field: 'Created',
            allowNull: true
        },
        size: {
            type: DataTypes.INTEGER,
            field: 'Size',
            allowNull: true
        },
        importance: {
            type: DataTypes.STRING(10),
            field: 'Importance',
            allowNull: true
        },
        submitted: {
            type: DataTypes.BOOLEAN,
            field: 'Submitted',
            allowNull: true
        },
        draft: {
            type: DataTypes.BOOLEAN,
            field: 'Draft',
            allowNull: true
        },
        hasAttachment: {
            type: DataTypes.BOOLEAN,
            field: 'HasAttachment',
            allowNull: true
        },
        displayCc: {
            type: DataTypes.STRING(255),
            field: 'DisplayCc',
            allowNull: true
        },
        organizer: {
            type: DataTypes.STRING(100),
            field: 'Organizer',
            allowNull: true
        },
        reminderDueBy: {
            type: DataTypes.DATE,
            field: 'ReminderDueBy',
            allowNull: true
        },
        reminderIsSet: {
            type: DataTypes.BOOLEAN,
            field: 'ReminderIsSet',
            allowNull: true
        },
        reminderMinutesBeforeStart: {
            type: DataTypes.INTEGER,
            field: 'ReminderMinutesBeforeStart',
            allowNull: true
        },
        startTime: {
            type: DataTypes.DATE,
            field: 'StartTime',
            allowNull: true
        },
        endTime: {
            type: DataTypes.DATE,
            field: 'EndTime',
            allowNull: true
        },
        isAllDayEvent: {
            type: DataTypes.BOOLEAN,
            field: 'IsAllDayEvent',
            allowNull: true
        },
        legacyFreeBusyStatus: {
            type: DataTypes.STRING(10),
            field: 'LegacyFreeBusyStatus',
            allowNull: true
        },
        location: {
            type: DataTypes.STRING(100),
            field: 'Location',
            allowNull: true
        },
        isMeeting: {
            type: DataTypes.BOOLEAN,
            field: 'isMeeting',
            allowNull: true
        },
        isRecurring: {
            type: DataTypes.BOOLEAN,
            field: 'isRecurring',
            allowNull: true
        },
        meetingRequestWasSent: {
            type: DataTypes.BOOLEAN,
            field: 'MeetingRequestWasSent',
            allowNull: true
        },
        isResponseRequested: {
            type: DataTypes.BOOLEAN,
            field: 'IsResponseRequested',
            allowNull: true
        },
        isFromMe: {
            type: DataTypes.BOOLEAN,
            field: 'IsFromMe',
            allowNull: true
        },
        allowNewTimeProposal: {
            type: DataTypes.BOOLEAN,
            field: 'AllowNewTimeProposal',
            allowNull: true
        },
        isResend: {
            type: DataTypes.BOOLEAN,
            field: 'IsResend',
            allowNull: true
        },
        isUnmodified: {
            type: DataTypes.BOOLEAN,
            field: 'IsUnmodified',
            allowNull: true
        },
        calendarItemType: {
            type: DataTypes.STRING(20),
            field: 'CalendarItemType',
            allowNull: true
        },
        myResponseType: {
            type: DataTypes.STRING(20),
            field: 'MyResponseType',
            allowNull: true
        },
        duration: {
            type: DataTypes.STRING(20),
            field: 'Duration',
            allowNull: true
        },
        timeZone: {
            type: DataTypes.STRING(60),
            field: 'TimeZone',
            allowNull: true
        },
        culture: {
            type: DataTypes.STRING(60),
            field: 'Culture',
            allowNull: true
        },
        conferenceType: {
            type: DataTypes.INTEGER,
            field: 'ConferenceType',
            allowNull: true
        },
        appointmentState: {
            type: DataTypes.INTEGER,
            field: 'AppointmentState',
            allowNull: true
        },
        appointmentSequenceNumber: {
            type: DataTypes.INTEGER,
            field: 'AppointmentSequenceNumber',
            allowNull: true
        }
    }, {
        schema: 'public',
        tableName: 'CalendarAppointment',
        timestamps: false
    });
};

module.exports.initRelations = function() {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.
    var model = require('../index');
    var CalendarAppointment = model.CalendarAppointment;

};
