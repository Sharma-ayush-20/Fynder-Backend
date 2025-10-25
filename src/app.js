const express = require("express");

const app = express();

const PORT = 4000;

app.use("/", (req, res) => {
    res.send("Hello World")
})

app.listen(PORT, () => {
    console.log(`Server is Listening at http://localhost:${PORT}`)
})