import mongoose from "mongoose";


// Message Schema
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true, 
  },
  timestamp: {
    type: Date,
    default: Date.now, 
  },
  sender: {
    type: String,
    required: true, 
  },
 

});

// Chat Room Schema
const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  messages: {
    type: [messageSchema],
    required: true, 
    default: [], 
  },
  tutorId: { type:String },
  studentId: { type:String },


});

const ChatRoom =
  mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;



