const express = require("express");
require('dotenv').config()
const { connectDB } = require("./config/database.js");

const app = express();

const PORT = 4000;

app.use("/", (req, res) => {
  res.send("Hello World");
});

connectDB()
  .then(() => {
    console.log(`Database Connected SuccessFully....`);
    app.listen(PORT, () => {
      console.log(`Server is Listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Problem in database Connection`, error.message);
  });
