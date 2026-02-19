const prisma = require('../prismaClient');
const logger = require('../logger/logger');

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { addresses: true },
    });

    if (!profile) {
      logger.warn(`Profile not found for user: ${req.user.id}`);
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    logger.info(`Profile fetched for user: ${req.user.id}`);
    res.json({ success: true, data: profile });
  } catch (error) {
    logger.error(`getProfile error for user ${req.user.id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CREATE / UPDATE PROFILE
const upsertProfile = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: { name, phone },
      create: {
        userId: req.user.id,
        name,
        phone,
      },
    });

    logger.info(`Profile upserted for user: ${req.user.id}`);
    res.json({ success: true, data: profile });
  } catch (error) {
    logger.error(`upsertProfile error for user ${req.user.id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADD ADDRESS
const addAddress = async (req, res) => {
  const { street, city, country } = req.body;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      logger.warn(`addAddress failed - profile not found for user: ${req.user.id}`);
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const address = await prisma.address.create({
      data: {
        profileId: profile.userId,
        street,
        city,
        country,
      },
    });

    logger.info(`Address added for user: ${req.user.id}, profileId: ${profile.id}`);
    res.json({ success: true, data: address });
  } catch (error) {
    logger.error(`addAddress error for user ${req.user.id}: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getProfile,
  upsertProfile,
  addAddress,
};