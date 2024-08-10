const express = require("express");
const { app, server } = require("./socket");
const path = require("path");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");

require("dotenv").config();
// Use CORS with option
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "HEAD", "PUT", "DELETE", "POST"],
    credentials: true,
  })
);

app.use(express.json());
const db = require("./database/db");
const PORT = process.env.PORT || 5000
db();
app.use("/auth", userRouter);
app.use("/chat", chatRouter);

server.listen(PORT, () => {
  console.log(`server is started in ${PORT}`);
});
