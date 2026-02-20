const express = require("express");
const orderRoutes = require("./routes/orderRoute");

const app = express();

app.use(express.json());
app.use("/api/orders", orderRoutes);

module.exports = app;
