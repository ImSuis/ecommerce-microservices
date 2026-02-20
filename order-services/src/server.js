const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 4005;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
