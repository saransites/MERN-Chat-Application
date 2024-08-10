const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const server = http.createServer(app);
require('dotenv').config()
const io = new Server(server, {
  cors: {
    origin: "https://mern-chat-application-a8lw.onrender.com",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});
const messageModal = require("./models/messageModal");

let onlineUsers = [];
let users = {};
// Add a user to the online users list
const addUser = (userId, socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
  onlineUsers.push({ userId, socketId });
};

// Remove a user from the online users list
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

// Get a user from the online users list
const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle user login
  socket.on("user-login", async (data) => {
    const { userId, roomIds } = data;
    addUser(userId, socket.id);
    io.emit("online-users", onlineUsers);

    try {
      let unreadMessages = [];
      for (const room of roomIds) {
        const roomUnreadMessages = await messageModal.find({
          roomId: room,
          isRead: false,
        });
        unreadMessages = unreadMessages.concat(roomUnreadMessages);
      }
      socket.emit("unread-messages", unreadMessages);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  });

  // Handle fetching messages
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

  // When a user joins a room
  socket.on("joinRoom", async (data) => {
    const { roomId, userId } = data;
    socket.join(roomId); // Join the user to the specific room
    users[userId] = roomId; // Store the user's room
    console.log(`${userId} joined room ${roomId}`);

    // Update message status to "seen" for this user
    try {
      await messageModal.updateMany(
        { roomId, receiverId: userId, status: "delivered" },
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

    // Notify other users in the room that someone has joined
    socket.to(roomId).emit("userJoined", userId);
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
          { status: "delivered" }, // Initially set to "delivered"
          { new: true }
        );
        io.to(receiver.socketId).emit("receive-message", updatedMessage);

        // Check if the receiver is currently viewing the room
        if (users[receiverId] == roomId) {
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

  // Handle user logout
  socket.on("user-logout", (userId) => {
    removeUser(socket.id);
    io.emit("online-users", onlineUsers);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    removeUser(socket.id);
    io.emit("online-users", onlineUsers);
  });
});

module.exports = {
  app,
  http,
  server,
};
