const express = require("express");
const app = express();
const http = require("http");
const moment = require("moment");
const { Server } = require("socket.io");
const server = http.createServer(app);
require("dotenv").config();
const messageModal = require("./models/messageModal");

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});

let onlineUsers = [];
let users = {};
let lastSeenTimes = {};
const addUser = (userId, socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
  onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  const user = onlineUsers.find((user) => user.socketId === socketId);
  if (user) {
    lastSeenTimes[user.userId] = moment().format(); // Store last seen time
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  }
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected");
  // Handle user login
  socket.on("user-login", (data) => {
    const { userId } = data;
    addUser(userId, socket.id);
    io.emit("online-users", onlineUsers);
  });

  // Fetch messages for a room
  socket.on("get-messages", async (roomId) => {
    try {
      const messages = await messageModal
        .find({ roomId: roomId.toString() })
        .sort({ createdAt: 1 });
      socket.emit("receive-messages", messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });

  // Join a room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    users[userId] = roomId;
    console.log(`${userId} joined room ${roomId}`);

    try {
      await messageModal.updateMany(
        { roomId, receiverId: userId, status: { $in: ["sent", "delivered"] } },
        { status: "seen" }
      );
      const seenMessages = await messageModal.find({
        roomId,
        receiverId: userId,
      });
      socket.emit("message-seen", seenMessages);
    } catch (error) {
      console.error("Error updating message status to seen:", error);
    }

    socket.to(roomId).emit("userJoined", { roomId, userId });
  });
  // Handle leaving a room
  socket.on("leaveRoom", ({ roomId, userId }) => {
    socket.leave(roomId);
    delete users[userId];
    console.log(`${userId} left room ${roomId}`);
    socket.to(roomId).emit("userLeft", { roomId, userId });
  });

  // Handle sending a message
  socket.on("send-message", async (data) => {
    const { roomId, receiverId } = data;
    try {
      const message = new messageModal(data);
      await message.save();

      const receiver = getUser(receiverId);

      if (receiver) {
        const updatedMessage = await messageModal.findByIdAndUpdate(
          message._id,
          { status: "delivered" },
          { new: true }
        );
        io.to(receiver.socketId).emit("receive-message", updatedMessage);
        // Update message status to "seen" if the receiver is in the room
        if (users[receiverId] === roomId) {
          const seenMessage = await messageModal.findByIdAndUpdate(
            message._id,
            { status: "seen" },
            { new: true }
          );
          io.to(receiver.socketId).emit("receive-message", seenMessage);
        }

        socket.emit("message-sent", updatedMessage);
      } else {
        socket.emit("message-sent", message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
  // Handle deleting a message
  socket.on("delete-message", async ({ id, roomId }) => {
    try {
      const deletedMessage = await messageModal.findByIdAndDelete(id);

      if (deletedMessage) {
        // Emit an event to all clients in the room that the message was deleted
        io.to(roomId).emit("message-deleted", id);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  // Handle user logout
  socket.on("user-logout", (userId) => {
    removeUser(socket.id);
    io.emit("online-users", onlineUsers);
    io.emit("user-last-seen", { userId, lastSeen: lastSeenTimes[userId] });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    removeUser(socket.id);
    io.emit("online-users", onlineUsers);

    const user = onlineUsers.find((user) => user.socketId === socket.id);
    if (user) {
      io.emit("user-last-seen", {
        userId: user.userId,
        lastSeen: lastSeenTimes[user.userId],
      });
    }
  });
});

module.exports = {
  app,
  http,
  server,
};
