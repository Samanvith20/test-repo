import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });
  
 console.log("query::",req.query);
  const role = session.role;
  const scheduledClassId = req.query.scheduledClassId; // Passed from the frontend
  const sdktoken= req.query.sdktoken;
  console.log("sdktoken::",sdktoken);
  try {
    await dbConnect();

    // Check if the class exists
    const scheduledClass = await ScheduledClasses.findById(scheduledClassId);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Return existing whiteboard details if they exist
    if (scheduledClass.whiteboard?.roomUuid && scheduledClass.whiteboard?.roomToken) {
      return res.status(200).json({
        roomUuid: scheduledClass.whiteboard.roomUuid,
        roomToken: scheduledClass.whiteboard.roomToken,
      });
    }

    // Create a new whiteboard room
    const roomResponse = await axios.post(
      "https://api.netless.link/v5/rooms",
      {
        isRecord: true, // Enable recording 
         
         

      },
      {
        headers: {
          "Content-Type": "application/json",
          token: sdktoken,
          region: "us-sv",
        },
      }
    );

    if (!roomResponse.data?.uuid) {
      throw new Error("Failed to create whiteboard room: Invalid response");
    }

    const { uuid: roomUuid } = roomResponse.data;

    // Generate a room token with recording permissions
    const tokenResponse = await axios.post(
      `https://api.netless.link/v5/tokens/rooms/${roomUuid}`,
      {
        lifespan: process.env.NETLESS_TOKEN_LIFESPAN || 3600000, // Configurable lifespan
        role: "admin", // Admin role for full access
       
      },
      {
        headers: {
          "Content-Type": "application/json",
          token: sdktoken,
        },
      }
    );

    const roomToken = tokenResponse.data;

    if (!roomToken) {
      throw new Error("Failed to generate room token: Invalid response");
    }

    // Save the whiteboard details in the database
    scheduledClass.whiteboard = { roomUuid, roomToken };
    await scheduledClass.save();

    return res.status(200).json({ roomUuid, roomToken });
  } catch (error) {
    console.error(
      "Error creating or fetching whiteboard room:",
      error.response?.data || error.message,
      error.stack
    );
    res.status(500).json({ message: "Failed to create or fetch whiteboard room" });
  }
}
