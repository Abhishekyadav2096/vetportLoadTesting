const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    clinic: {
      type: Schema.Types.ObjectId,
      // ref:  Clinic.modelName,
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      // ref:  Client.modelName,
    },
    patient: {
      type: Schema.Types.ObjectId,
      // ref:  Patient.modelName,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    delReason: {
      type: String,
      trim: true,
    },
    appStatus: {
      type: Schema.Types.ObjectId,
      // ref:  AppointmentStatus.modelName,
    },
    reason: {
      type: Schema.Types.ObjectId,
      // ref:  Visitreason.modelName,
    },
    appType: {
      type: Schema.Types.ObjectId,
      // ref:  Appointmenttype.modelName,
    },
    equipment: [
      {
        type: Schema.Types.ObjectId,
        // ref:  Equipment.modelName,
      },
    ],
    staff: [
      {
        type: Schema.Types.ObjectId,
        // ref:  Staff.modelName,
        required: true,
      },
    ],
    parentId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    app_parent: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    appMail: {
      type: Number, // 14 is for true 15 is for false
      default: 15,
    },
    appSms: {
      type: Number, // 14 is for true 15 is for false
      default: 15,
    },
    chkDrop: {
      type: Number, // 1 is for active and 2 is for Inactive
      default: 2,
    },
    dropOff: {
      type: Date,
    },
    clientReq: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
      default: null,
    },
    recordStatus: {
      type: String,
      trim: true,
      enum: ["Active", "Modified", "Deleted"],
      default: "Active",
    },
    onlineBooking: {
      type: Number, // 7 is for yes 8 is for no
      default: 8,
    },
    meetLink: {
      type: String,
      trim: true,
    },
    // Recurring id for linking the reccurring appointments
    recurringId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true, strict: false }
);

const appointmentModel = mongoose.model("appt", appointmentSchema);

module.exports = appointmentModel;
