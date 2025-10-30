const express = require("express");
const connectDB = require("./db");
const cors = require("cors");
const app = express();
const port = 3000;
const cardRoutes = require("./routes");

app.use(cors());
app.use(express.json());

connectDB();

app.use("/cards", cardRoutes);

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = { server, app };
