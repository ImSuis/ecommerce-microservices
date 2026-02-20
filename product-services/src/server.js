const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
