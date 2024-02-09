const router = require("express").Router();

router.use("/client", require("./client"));
router.use("/patient", require("./patient"));

module.exports = router;
