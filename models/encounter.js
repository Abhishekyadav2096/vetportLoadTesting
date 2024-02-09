const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const encounterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    des: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
      default: null,
    },
    status: {
      type: Number,
      default: 1,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    emr: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// index for case insensitive unique

// Change start_seq to have different starting count
// encounter.plugin(AutoIncrement, {
//   inc_field: "encNo",
//   start_seq: 1,
// });
const EncounterModel = mongoose.model("encounter", encounterSchema);

module.exports = EncounterModel;
