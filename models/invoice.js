const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      // ref:  Client.modelName,
      required: true,
      default: null,
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      // ref:  Clinic.modelName,
      required: true,
      default: null,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      // ref:  McLocation.modelName,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: Number,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    desc: { type: String, trim: true, default: null },
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      // ref:  Discount.modelName,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
      default: null,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      // ref:  Staff.modelName,
      default: null,
    },
    wellPlanId: {
      type: Schema.Types.ObjectId,
      // ref:  WellPlan.modelName,
      default: null,
    },
    cartId: {
      type: Schema.Types.ObjectId,
    },
    // for equine billing
    equine_parent: {
      type: Schema.Types.ObjectId,
    },
    equineBilling: {
      type: Boolean,
      default: false,
    },
    primary: {
      type: Boolean,
    },
    percent: {
      type: Number,
    },
    partial: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const InvoiceModel = mongoose.model("invoice", invoiceSchema);

module.exports = InvoiceModel;
