const express = require("express");
const { authGuard } = require("../middleware/authGuard");
const {
  getProfile,
  upsertProfile,
  addAddress,
} = require("../controllers/userController");
const validate = require("../middleware/validate");
const { upsertProfileSchema, addAddressSchema } = require("../validators/userValidator");

const router = express.Router();

router.get("/profile", authGuard, getProfile);
router.post("/profile", authGuard, validate(upsertProfileSchema), upsertProfile);
router.post("/address", authGuard, validate(addAddressSchema), addAddress);

module.exports = router;
