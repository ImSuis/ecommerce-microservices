const express = require("express");
const productRoutes = require("./routes/productRoute");

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);

module.exports = app;
