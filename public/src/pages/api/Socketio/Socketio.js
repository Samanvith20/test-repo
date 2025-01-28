




import { Server } from "socket.io";
import ChatRoom from "../models/Chat"; 

let io;

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket.IO is already initialized.");
    res.end();
    return;
  }

  console.log("Initializing Socket.IO...");

  io = new Server(res.socket.server, {
    path: "/api/Socketio/Socketio",
    cors: {
      origin:`${process.env.NEXT_PUBLIC_SOCKET_URL}`,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle room join and emit past messages
    socket.on("joinRoom", async ({ roomId }) => {
      console.log(`User ${socket.id} is joining room ${roomId}`);

      // Join the room
      socket.join(roomId);
      console.log(`User with ID ${socket.id} joined room: ${roomId}`);

      try {
        // Retrieve past messages from the DB
        const chatRoom = await ChatRoom.findOne({ roomId });

        if (chatRoom) {
          console.log(`Chat room found: ${roomId}`);
          // Emit past messages to the user when they join
          socket.emit("loadPastMessages", {
            roomId,
            allMessages: chatRoom.messages,
          });
          console.log(`Emitting past messages for room ${roomId}`);
        } else {
          console.log(`Chat room not found for roomId: ${roomId}`);
          socket.emit("loadPastMessages", {
            roomId,
            allMessages: [],
          });
        }
      } catch (error) {
        console.error("Error fetching past messages:", error);
        socket.emit("loadPastMessages", {
          roomId,
          allMessages: [],
        });
      }
    });

    // Handle sending new messages
    socket.on("sendMessage", async ({ roomId, senderId, message }, callback) => {
      console.log("sendMessage event received:", { roomId, senderId, message });

      const [studentId, tutorId] = roomId.split("_");
      try {
        // Find or create the chat room
        let chatRoom = await ChatRoom.findOne({ roomId });
        if (!chatRoom) {
          console.log(`Chat room ${roomId} not found. Creating a new one.`);
          chatRoom = new ChatRoom({
            roomId,
            studentId,
            tutorId,
            messages: [],
          });
          await chatRoom.save();
          console.log(`Chat room ${roomId} created.`);
        }

        // Create the new message object
        const newMessage = {
          sender: senderId,
          message,
          timestamp: new Date().toISOString(),
        };

        // Add the new message to the room
        chatRoom.messages.push(newMessage);
        await chatRoom.save();

        // Emit only the new message to all users in the room
        io.to(roomId).emit("newMessage", { roomId, ...newMessage });
        console.log("Emitting newMessage:", { roomId, ...newMessage });

        callback({ success: true });
      } catch (error) {
        console.error("Error saving message:", error);
        callback({ success: false, error: "Internal server error" });
      }
    });

    // Handle leaving a room
    socket.on("leaveRoom", ({ roomId }) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room: ${roomId}`);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
}
