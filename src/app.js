const express = require("express");
require("dotenv").config();
const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser");

const { authRouter } = require("./routes/auth.js");
const { profileRouter } = require("./routes/profile.js");
const { requestRouter } = require("./routes/request.js");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter)

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
