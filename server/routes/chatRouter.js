const { deleteMessage, updateMessage, getRooms } = require("../controllers/message.controller");

const chatRouter = require("express").Router();

chatRouter.get("/rooms", getRooms);
chatRouter.put("/messages/:roomId", updateMessage);
chatRouter.delete("/messages/:id", deleteMessage)

module.exports = chatRouter;
