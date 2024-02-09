const clientModel = require("../models/client");
const InvoiceModel = require("../models/invoice");
const ObjectId = require("mongoose").Types.ObjectId;
const SalesModel = require("../models/sales");
const salesTaxModel = require("../models/salesTax");

// create client
exports.create = async (req, res) => {
  try {
    // console.log("Creating clients...");

    const batchSize = 100; // Number of documents to create in each batch
    const totalClients = 25000; // Total number of clients to create
    const totalBatches = Math.ceil(totalClients / batchSize); // Calculate total batches

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize + 1;
      const batchEnd = Math.min((batchIndex + 1) * batchSize, totalClients);

      console.log(`Creating clients from ${batchStart} to ${batchEnd}`);

      // Create documents for this batch
      let promises = [];
      for (let i = batchStart; i <= batchEnd; i++) {
        const clonedBody = { ...req.body };
        clonedBody.firstName = `client_test_${i}`;
        clonedBody.lastName = `rai_${i}`;
        promises.push(clientModel.create(clonedBody));
      }

      // Wait for all documents in this batch to be created
      await Promise.all(promises);

      // console.log(`Batch ${batchIndex + 1} created successfully`);
    }

    res.status(201).json({ message: "Clients created successfully" });
  } catch (error) {
    console.error("Error creating clients:", error);
    res.status(500).json(error);
  }
};

// add sales and sales tax

exports.addSales = async (req, res) => {
  try {
    const body = req.body;
    const batchSize = 1000; // Adjust batch size as needed
    const totalInvoices = await InvoiceModel.countDocuments();
    const numBatches = Math.ceil(totalInvoices / batchSize);

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const invoices = await InvoiceModel.aggregate([
        { $skip: batchIndex * batchSize },
        { $limit: batchSize },
        {
          $lookup: {
            from: "clients",
            as: "clients",
            let: { id: "$clientId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
              { $project: { firstName: 1 } },
            ],
          },
        },
        { $unwind: { path: "$clients", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "petients",
            as: "petients",
            let: { id: "$clients._id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$clientId", "$$id"] } } },
              { $limit: 1 },
              { $project: { name: 1 } },
            ],
          },
        },
        { $unwind: { path: "$petients", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "encounters",
            as: "encounters",
            let: { id: "$petients._id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$patientId", "$$id"] } } },
              { $limit: 1 },
              { $project: { name: 1 } },
            ],
          },
        },
        { $unwind: { path: "$encounters", preserveNullAndEmptyArrays: true } },
      ]);

      const salesBulkOps = [];
      // const salesTaxBulkOps = [];

      for (const invoice of invoices) {
        for (const sale of body) {
          const salesData = constructSalesData(invoice, sale);
          salesBulkOps.push({ insertOne: { document: salesData } });

          // const salesTaxData = constructSalesTaxData(invoice, sale);
          // salesTaxBulkOps.push({ insertOne: { document: salesTaxData } });
        }
      }

      await SalesModel.bulkWrite(salesBulkOps);
      // await SalesTaxModel.bulkWrite(salesTaxBulkOps);
    }

    res.status(201).json({ message: "Sales data added successfully." });
  } catch (error) {
    console.error("Error adding sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function constructSalesData(invoice, sale) {
  return {
    referralId: sale.sales.referralId,
    planitemId: sale.sales.planitemId,
    clinicId: sale.sales.clinicId,
    staffId: sale.sales.staffId,
    discountId: sale.sales.discountId,
    quantity: sale.sales.quantity,
    clinicCost: sale.sales.clinicCost,
    tax: sale.sales.tax,
    discount: sale.sales.discount,
    total: sale.sales.total,
    decline: sale.sales.decline,
    commission: sale.sales.commission,
    serviceFee: sale.sales.serviceFee,
    calc_format: sale.sales.calc_format,
    isReturn: sale.sales.isReturn,
    invoiceId: invoice._id,
    encounterId: invoice.encounters._id,
    clientId: invoice.clientId,
    patientId: invoice.petients._id,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

// function constructSalesTaxData(invoice, sale) {
//   return {
//     invoiceId: invoice._id,
//     tax_details: sale.salesTax.tax_details,
//     createdAt: invoice.createdAt,
//     updatedAt: invoice.updatedAt,
//   };
// }

exports.addSalesTax = async (req, res) => {
  try {
    const { tax_details } = req.body;
    const { planitemId } = req.query;
    // Fetch sales documents matching the planitemId
    const sales = await SalesModel.find({ planitemId });
    // Define batch size for processing
    const batchSize = 1000;
    for (let i = 0; i < sales.length; i += batchSize) {
      const batchSales = sales.slice(i, i + batchSize);
      // Create an array to store promises for each sales tax creation
      const salesTaxPromises = batchSales.map((sale) => {
        const salesTaxData = {
          salesId: sale._id,
          invoiceId: sale.invoiceId, // Assuming _id field of sales document is the salesId
          tax_details,
          createdAt: sale.createdAt,
          updatedAt: sale.updatedAt,
        };
        // Return the promise returned by create()
        return salesTaxModel.create(salesTaxData);
      });
      // Wait for all sales tax creation promises to resolve before proceeding to the next batch
      await Promise.all(salesTaxPromises);
    }
    res.status(202).json({ message: "Sales tax data added successfully." });
  } catch (error) {
    console.error("Error adding sales tax data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
