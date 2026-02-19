const express = require("express");
const { authGuard } = require("../middleware/authGuard");
const {
  getProfile,
  upsertProfile,
  addAddress,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", authGuard, getProfile);
router.post("/profile", authGuard, upsertProfile);
router.post("/address", authGuard, addAddress);

module.exports = router;
