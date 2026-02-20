const express = require("express");
const cartRoutes = require("./routes/cartRoute");

const app = express();

app.use(express.json());

app.use("/api/cart", cartRoutes);

module.exports = app;
