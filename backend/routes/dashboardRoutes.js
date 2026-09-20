const express = require("express");

const { getDashboard } = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getDashboard);

module.exports = router;