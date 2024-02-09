const express = require("express");
const router = express.Router();

const client = require("../../controllers/client");

router.post("/add", client.create);
router.post("/addSales", client.addSales);
router.post("/addSalesTax", client.addSalesTax);

module.exports = router;
