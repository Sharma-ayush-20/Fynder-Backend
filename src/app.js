const express = require("express");
require("dotenv").config();
require("./utils/cronJob.js")
const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("http")

const { authRouter } = require("./routes/auth.js");
const { profileRouter } = require("./routes/profile.js");
const { requestRouter } = require("./routes/request.js");
const { userRouter } = require("./routes/user.js");
const { paymentRouter } = require("./routes/payment.js");
const initializeSocket = require("./utils/socket.js");
const { chatRouter } = require("./routes/chat.js");

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)
app.use("/", paymentRouter)
app.use("/", chatRouter);

const server = createServer(app)
initializeSocket(server)

connectDB()
  .then(() => {
    console.log(`Database Connected SuccessFully....`);
    server.listen(PORT, () => {
      console.log(`Server is Listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Problem in database Connection`, error.message);
  });
