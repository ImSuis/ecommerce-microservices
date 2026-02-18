const dotenv = require('dotenv');
dotenv.config(); // must be before any other imports
const app = require('./app');

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});