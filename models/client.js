const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const { ORIGIN_ID } = require("../config");

const clientSchema = new Schema(
  {
    clinic: {
      type: Schema.Types.ObjectId,
      // ref:  Clinic.modelName,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      // ref:  McLocation.modelName,
      default: null,
    },
    clientLogId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: Schema.Types.ObjectId,
      // ref:  Title.modelName,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    address1: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      // ref:  State.modelName,
      //   required: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      // ref:  Country.modelName,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    zipcode: {
      type: String,
      required: true,
      trim: true,
    },
    phone: [
      {
        _id: false,
        phoneType: {
          type: Schema.Types.ObjectId,
          // ref:  PhoneType.modelName,
        },
        // 0 => undefined, 1 => active
        isDefault: {
          type: Number,
          default: 0,
        },
      },
    ],
    // 8 => no, 7 => yes
    reminders: {
      type: Number,
      default: 8,
    },
    // 8 => no, 7 => yes
    announcements: {
      type: Number,
      default: 8,
    },
    // 8 => no, 7 => yes
    statements: {
      type: Number,
      default: 8,
    },
    // 8 => no, 7 => yes
    declineEmail: {
      type: Number,
      default: 8,
    },
    // 8 => no, 7 => yes
    smsDecline: {
      type: Number,
      default: 8,
    },
    preferredProvider: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
    },
    // 8 => no, 7 => yes
    isInterest: {
      type: Number,
      default: 8,
    },
    // 8 => no, 7 => yes
    isDiscount: {
      type: Number,
      default: 8,
    },
    // 1 => active, 2 => inactive
    status: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
    },
    cdetails: [
      {
        _id: false,
        phoneType: {
          type: Schema.Types.ObjectId,
          // ref:  PhoneType.modelName,
        },
        relationship: {
          type: Schema.Types.ObjectId,
          // ref:  Relationship.modelName,
        },
      },
    ],
    dob: {
      type: Date,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        // ref:  Tag.modelName,
      },
    ],
    // originID_: {
    //   type: String,
    //   default: ORIGIN_ID,
    // },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Change start_seq to have different starting count
// clientregistration.plugin(AutoIncrement, {
//   inc_field: "clientNo",
//   start_seq: 1,
// });

const ClientModel = mongoose.model("Client", clientSchema);

module.exports = ClientModel;
