const prisma = require('../prismaClient');
const logger = require('../logger/logger');

// CREATE — admin only
const createProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  try {
    const product = await prisma.product.create({
      data: { name, description, price, category, stock },
    });

    logger.info(`Product created: ${product.id} by admin ${req.user.id}`);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    logger.error(`createProduct error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL — with pagination, filtering, search
const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const where = {
    ...(category && { category }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        }
      : {}),
  };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    logger.info(`Products listed — page ${page}, total ${total}`);
    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`getProducts error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ONE
const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      logger.warn(`Product not found: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error(`getProductById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE — admin only
const updateProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, price, category, stock },
    });

    logger.info(`Product updated: ${req.params.id} by admin ${req.user.id}`);
    res.json({ success: true, data: product });
  } catch (error) {
    logger.error(`updateProduct error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE — admin only
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });

    logger.info(`Product deleted: ${req.params.id} by admin ${req.user.id}`);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    logger.error(`deleteProduct error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};