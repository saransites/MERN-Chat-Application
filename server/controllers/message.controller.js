const messageModel = require("../models/messageModal");

const getRooms = async (req, res) => {
  try {
    const rooms = await messageModel.find().select("roomId -_id"); // Only select roomId field
    const uniqueRoomIds = rooms.reduce((acc, cur) => {
      if (!acc.includes(cur.roomId)) {
        acc.push(cur.roomId);
      }
      return acc;
    }, []);
    res.json(uniqueRoomIds);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred while fetching rooms" });
  }
};
const updateMessage = async (req, res) => {
  let { roomId } = req.params; // Ensure this is the roomId you want to update messages for
  // Validate if roomId is valid (optional based on your use case)
  if (!roomId) {
    return res.status(400).json({ message: "roomId is required" });
  }

  try {
    roomId = roomId.toString();
    // Update messages based on roomId
    const result = await messageModel.updateMany(
      { roomId: roomId }, // Find messages by roomId
      { isRead: true }, // Update the isRead field
      { new: true } // Option to return the updated documents
    );

    // Check if any documents were modified
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "No messages found for this roomId" });
    }

    res.json({ message: "Messages updated successfully", data: result });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    await messageModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message", error });
  }
};

module.exports = {
  getRooms,
  deleteMessage,
  updateMessage,
};
