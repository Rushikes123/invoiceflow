const express = require("express");

const {
  addPayment,
  getPaymentHistory
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/:invoiceId", addPayment);
router.get("/:invoiceId", getPaymentHistory);

module.exports = router;