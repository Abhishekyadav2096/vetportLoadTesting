const patientModel = require("../models/patient");
const clientModel = require("../models/client");
const EncounterModel = require("../models/encounter");
const InvoiceModel = require("../models/invoice");
const AppointmentModel = require("../models/appointment");
const ObjectId = require("mongoose").Types.ObjectId;
const dayjs = require("dayjs");

// create patient
exports.create = async (req, res) => {
  try {
    const clients = await clientModel.find({}).limit(25000);

    const patientsData = req.body;

    const batchCount = 1000; // Number of documents to insert in each batch

    const promises = [];

    for (const client of clients) {
      for (let i = 0; i < 4; i++) {
        const patientData = patientsData[i];
        const species = patientData.species;
        const name = `${client.firstName}_pat${i + 1}`;

        promises.push(
          patientModel.create({
            ...patientData,
            clientId: client._id,
            species,
            name,
          })
        );
      }
      if (promises.length >= batchCount) {
        await Promise.all(promises); // Wait for current batch to complete
        promises.length = 0; // Clear the promises array for the next batch
      }
    }

    // Insert remaining documents
    await Promise.all(promises);

    res.status(201).json({ message: "Patients created successfully" });
  } catch (error) {
    console.error("Error creating patients:", error);
    res.status(500).json({ error: "Error creating patients" });
  }
};

// create encounter

exports.createEncounter = async (req, res) => {
  try {
    const patients = await patientModel.find({}).limit(100000);
    const encounterData = req.body;

    let encounterCounter = 1; // Initialize the encounter counter

    const batchCount = 1000; // Number of encounters to insert in each batch
    const promises = [];

    for (const patient of patients) {
      // Create encounter data for each patient
      const encounter = {
        ...encounterData,
        patientId: patient._id, // Set the patient ID for the encounter
        encNo: encounterCounter, // Set the encounter number
      };

      promises.push(EncounterModel.create(encounter));

      // Increment the encounter counter for the next encounter
      encounterCounter++;

      // If the promises array reaches the batch size, execute the batch
      if (promises.length >= batchCount) {
        await Promise.all(promises); // Wait for the batch to complete
        promises.length = 0; // Clear the promises array for the next batch
      }
    }

    // Insert remaining encounters
    await Promise.all(promises);

    res.status(201).json({ message: "Encounters created successfully" });
  } catch (error) {
    console.error("Error creating encounters:", error);
    res.status(500).json({ error: "Error creating encounters" });
  }
};

// add patientInfo

exports.createPatientInfo = async (req, res) => {
  try {
    const patDocs = await patientModel.aggregate([
      {
        $lookup: {
          from: "species",
          as: "species",
          let: { id: "$species" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { name: 1 } },
          ],
        },
      },
      { $unwind: { path: "$species", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "breeds",
          as: "breed",
          let: { id: "$breed" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { name: 1 } },
          ],
        },
      },
      { $unwind: { path: "$breed", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "colors",
          as: "color",
          let: { id: "$color" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { name: 1 } },
          ],
        },
      },
      { $unwind: { path: "$color", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "sexes",
          as: "sex",
          let: { id: "$sex" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { name: 1 } },
          ],
        },
      },
      { $unwind: { path: "$sex", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "tag",
          as: "tags",
          let: { id: "$tags" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$id"] } } },
            { $project: { name: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "clients",
          as: "clientInfo",
          let: { id: "$clientId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            {
              $lookup: {
                from: "countries",
                as: "country",
                let: { id: "$country" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                  { $project: { name: 1 } },
                ],
              },
            },
            { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "states",
                as: "state",
                let: { id: "$state" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                  { $project: { name: 1 } },
                ],
              },
            },
            { $unwind: { path: "$state", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "tag",
                as: "tags",
                let: { id: "$tags" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$id"] } } },
                  { $project: { name: 1 } },
                ],
              },
            },
          ],
        },
      },
      { $unwind: { path: "$clientInfo", preserveNullAndEmptyArrays: true } },
    ]);

    const bulkArr = [];
    for (let result of patDocs) {
      let _create = {};
      let tags = [...result.tags, ...result.clientInfo.tags];

      _create = {
        clientId: result.clientId.toString(),
        patientId: result._id.toString(),
        clientNo: result.clientInfo.clientNo,
        clientName: `${result.clientInfo.firstName} ${result.clientInfo.lastName}`,
        address1: result.clientInfo.address1,
        address2: result.clientInfo.address2,
        city: result.clientInfo.city,
        zipcode: result.clientInfo.zipcode,
        email: result.clientInfo.email,
        state: result.clientInfo.state.name,
        country: result.clientInfo.country.name,
        tags: tags?.map((v) => v.name).join("~"),
        phone: result.clientInfo.phone.map((v) => v.pnumber).join("~"),
        phoneMasked: result.clientInfo.phone.map((v) => v.maskedval).join("~"),
        patientNo: result.patientNo,
        patName: result.name,
        species: result.species?.name,
        breed: result.breed?.name,
        color: result.color?.name,
        sex: result.sex?.name,
        patIdentity: result.identity,
        rabiesTag: result.rtid,
        microchipId: result.microchipId,
        remarks: result.remarks,
        alert: result.alert,
        caregiverFName: result.clientInfo.cdetails
          ?.map((v) => v.firstName)
          .join("~"),
        caregiverLName: result.clientInfo.cdetails
          ?.map((v) => v.lastName)
          .join("~"),
        caregiverPhone: result.clientInfo.cdetails
          ?.map((v) => v.pnumber)
          .join("~"),
        caregiverPhoneMasked: result.clientInfo.cdetails
          ?.map((v) => v.maskedval)
          .join("~"),
      };

      const patInfo = Object.keys(_create)
        .map((v) => _create[v])
        .join("~");

      bulkArr.push({
        updateOne: {
          filter: { _id: result._id },
          update: {
            $set: {
              patientInfo: patInfo,
            },
          },
        },
      });
    }

    await patientModel.bulkWrite(bulkArr);
    res
      .status(200)
      .json({ message: "Patient information updated successfully." });
  } catch (error) {
    console.error("Error creating encounters:", error);
    res.status(500).json(error);
  }
};

// add invoice

exports.addInvoice = async (req, res) => {
  try {
    const {
      clinicLocId,
      amount,
      balance,
      parent_id,
      type,
      couponId,
      invoiceNo,
    } = req.body;

    // Fetch all clients
    const clients = await clientModel.find({}).limit(25000);

    // Define batch size for processing
    const batchSize = 1000;

    // Iterate over clients in batches
    for (let i = 0; i < clients.length; i += batchSize) {
      const batchClients = clients.slice(i, i + batchSize);

      // Process each batch in parallel
      await Promise.all(
        batchClients.map(async (client) => {
          const invoicesToCreate = [];

          // Generate invoices for the client
          for (let j = 0; j < 25; j++) {
            const invoiceData = {
              clientId: client._id,
              clinicId: client.clinic,
              clinicLocId,
              amount,
              balance,
              parent_id,
              type,
              couponId,
              invoiceNo: invoiceNo + j,
              createdBy: client.preferredProvider,
              createdAt: dayjs().subtract(
                (j + 1) * (j % 2 === 0 ? 1 : 2),
                "month"
              ),
            };

            invoicesToCreate.push(invoiceData);
          }

          // Bulk insert invoices for the client
          await InvoiceModel.insertMany(invoicesToCreate);
        })
      );
    }

    res.status(202).json({ message: "Invoices created successfully." });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.addAppt = async (req, res) => {
  try {
    const body = req.body;
    const batchSize = 1000; // Adjust batch size as needed
    const totalInvoices = await clientModel.countDocuments();
    const numBatches = Math.ceil(totalInvoices / batchSize);

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const docs = await clientModel.aggregate([
        { $limit: 2 },
        {
          $project: { firstName: 1 },
        },
        // { $skip: batchIndex * batchSize },
        // { $limit: batchSize },
        {
          $lookup: {
            from: "patients",
            as: "patients",
            let: { id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$clientId", "$$id"] } } },
              { $limit: 1 },
              { $project: { name: 1 } },
            ],
          },
        },
        { $unwind: { path: "$patients", preserveNullAndEmptyArrays: true } },
      ]);
      //   console.log(docs, "docs&&&");
      const apptsBulkOps = [];
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        for (let i = 0; i < body.length; i++) {
          const appt = body[i];
          const apptsData = constructSalesData(doc, appt, i);
          apptsBulkOps.push({ insertOne: { document: apptsData } });
        }
      }

      await AppointmentModel.bulkWrite(apptsBulkOps);
    }

    res.status(202).json({ message: "Sales data added successfully." });
  } catch (error) {
    console.error("Error adding sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function constructSalesData(client, appt, index) {
  //   Convert the start date from ISO 8601 format to a JavaScript Date object
  const startDate = new Date(appt.startTime);
  // Add 10-15 days gap for each appointment
  const adjustedStartDate = new Date(
    startDate.getTime() + (index * 10 + 10) * 24 * 60 * 60 * 1000
  ); // Adjust the gap as needed
  // Calculate createdBy and updatedBy dates
  const createdByDate = new Date(
    adjustedStartDate.getTime() - 2 * 24 * 60 * 60 * 1000
  ); // 2 days before startTime
  const updatedByDate = new Date(
    adjustedStartDate.getTime() - 2 * 24 * 60 * 60 * 1000
  ); // 2 days before startTime

  // Convert endTime to a Date object
  const endTime = new Date(appt.endTime);

  return {
    client: client._id,
    patient: client.patients._id,
    // Add additional fields
    comment: appt.comment,
    appStatus: appt.appStatus,
    appType: appt.appType,
    staff: appt.staff,
    clinic: appt.clinic,
    parentId: appt.parentId,
    appMail: appt.appMail,
    appSms: appt.appSms,
    chkDrop: appt.chkDrop,
    dropOff: appt.dropOff,
    clientReq: appt.clientReq,
    createdBy: appt.createdBy, // Convert back to a JavaScript Date object
    updatedBy: appt.updatedBy, // Convert back to a JavaScript Date object
    recordStatus: appt.recordStatus,
    onlineBooking: appt.onlineBooking,
    // Start and end time with adjusted dates
    startTime: adjustedStartDate, // Use the adjustedStartDate Date object
    endTime: endTime, // Use the endTime Date object
    // Include other fields as needed
    // startTime: appt.startTime,
    // endTime: appt.endTime,
  };
}
