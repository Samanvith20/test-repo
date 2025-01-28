import dbConnect from "./lib/mongoose";
import ChatRoom from "./models/Chat";

export default async function handler(req, res) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract the chat room ID from the query parameters
    const { roomId } = req.query;

    // console.log("Room ID:", roomId);

    // Validate the roomId query parameter
    if (!roomId) {
      return res.status(400).json({ error: "Missing roomId" });
    }

    // Split roomId into studentId and tutorId
    const [studentId, tutorId] = roomId.split("_");
    if (!studentId || !tutorId) {
      return res.status(400).json({ error: "Invalid roomId format" });
    }

    // Fetch the chat room by studentId and tutorId
    const chatRoom = await ChatRoom.findOne({
      studentId,
      tutorId,
    })
      .populate({
        path: "tutorId",
        select: "tutorDetails.firstName tutorDetails.lastName tutorDetails.profilePicture",
      })
      .populate({
        path: "studentId",
        select: "username studentDetails.firstName studentDetails.lastName profilePicture",
      })
      .exec();

    // If chat room is not found
    if (!chatRoom) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    // Sort the messages by timestamp (in case they are not already sorted)
    const sortedMessages = chatRoom.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Prepare the response data
    const chatHistory = {
      tutorName: `${chatRoom.tutorId.tutorDetails.firstName} ${chatRoom.tutorId.tutorDetails.lastName}`,
      tutorPhoto: chatRoom.tutorId?.tutorDetails?.profilePicture || null,
      studentName: `${chatRoom.studentId?.studentDetails?.firstName || ""} ${chatRoom.studentId?.studentDetails?.lastName || ""} ${chatRoom.studentId?.username || ""}`,
      studentPhoto: chatRoom.studentId?.profilePicture || null,
      message: sortedMessages.map((msg) => ({
        message: msg.message,
        timestamp: msg.timestamp,
        senderId:msg.sender
      })),
    };

    // console.log("Chat history fetched for room:", roomId);

    return res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
