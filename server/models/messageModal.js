const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const messageSchema = new Schema(
  {
    roomId: {
      type: String,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: String,
      // ref: "users",
      required: true,
    },
    receiverId: {
      type: String,
      // ref: "users",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "document"],
      required: true,
      default: "text",
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const messageModal=mongoose.model('message',messageSchema)

module.exports=messageModal