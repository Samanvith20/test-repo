import mongoose from "mongoose";
const videoEventSchema = new mongoose.Schema({
  
  channelName: String,
  valid: { type: Boolean, default: true },
  duration: { type: Number, default: 0 },
  studentEvents: [
    {
      studentId: String,
      action: String,
      timestamp: Date,
      
    },
  ],
  tutorEvents: [
    {
      tutorId: String,
      action: String,
      timestamp: Date,
      
    },
  ],
}, { timestamps: true });

// Create a unique index to ensure each (appId, channelName) combination is unique
videoEventSchema.index({  channelName: 1 }, { unique: true });

// Create the model from the schema
const VideoEvent = mongoose.models.VideoEvent || mongoose.model('VideoEvent', videoEventSchema) 
export default VideoEvent