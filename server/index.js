const express = require("express");
const { app, server } = require("./socket");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const User=require('./models/userModal')
require("dotenv").config();
// Use CORS with option
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "HEAD", "PUT", "DELETE", "POST"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.static('public'))
const db = require("./database/db");
const PORT = process.env.PORT || 5000;
db();
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'public/profile')
  },
  filename:(req,file,cb)=>{
    cb(null,file.fieldname + "_"+Date.now()+path.extname(file.originalname))
  }
})
const upload=multer({
  storage:storage
})
// Set up multer storage in memory
app.post("/profileImage", upload.single("profileImage"), async (req, res) => {
  try {
    const { email } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const existUser = await User.findOne({ email });

    if (existUser) {
      // Update the existing user's profile image
      existUser.profile = req.file.filename;
      await existUser.save();
      res
      .status(200)
        .json({
          message: "Profile image updated successfully", 
          user: existUser,
        });
    } 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/auth", userRouter);
app.use("/chat", chatRouter);

server.listen(PORT, () => {
  console.log(`server is started in ${PORT}`);
});

module.exports = {
  upload,
};
