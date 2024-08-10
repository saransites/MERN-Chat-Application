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
    // origin: "https://mern-chat-application-a8lw.onrender.com",
    origin:"*",
    methods: ["GET", "HEAD", "PUT", "DELETE", "POST"],
    credentials: true,
  })
);
const __dirname1 = path.resolve();

app.use(express.json());
const db=require("./database/db");

app.use(express.static(path.join(__dirname1, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname1, "client", "dist", "index.html"));
});
app.use("/auth", userRouter);
app.use("/chat", chatRouter);

server.listen(process.env.PORT, () => {
  db()
  console.log("server is started");
});
