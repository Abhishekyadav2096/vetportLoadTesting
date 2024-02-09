const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsales_taxSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  salesId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  tax_details: [
    {
      _id: false,
      level: Number,
      total: Number,
      doc: [
        {
          id: Schema.Types.ObjectId,
          rate: Number,
          value: Number,
          name: String,
          _id: false,
        },
      ],
    },
  ],
  // For equine billing
  equineBilling: {
    type: Boolean,
    default: false,
  },
  equine_parent: {
    type: Schema.Types.ObjectId,
  },
  primary: {
    type: Boolean,
  },
  splitId: {
    type: Schema.Types.ObjectId,
  },
});

const newSalesTaxModel = mongoose.model("newsales_taxe", newsales_taxSchema);

module.exports = newSalesTaxModel;
