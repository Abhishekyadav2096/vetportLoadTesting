const express = require("express");
const router = express.Router();

const patient = require("../../controllers/patient");

router.post("/add", patient.create);
router.post("/addEncounter", patient.createEncounter);
router.post("/addInvoice", patient.addInvoice);
router.post("/addAppt", patient.addAppt);
router.get("/updatePatient", patient.createPatientInfo);

module.exports = router;
