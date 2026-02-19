const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
