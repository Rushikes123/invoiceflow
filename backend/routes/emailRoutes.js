const express = require("express");

const {
  sendInvoiceEmail
} = require("../controllers/emailController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/invoice/:id", sendInvoiceEmail);

module.exports = router;