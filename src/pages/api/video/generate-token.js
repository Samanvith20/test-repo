import { RtcTokenBuilder, RtcRole } from "agora-token";
import dbConnect from "../lib/mongoose";
import ScheduledClasses from "../models/ScheduledClasses";


// For an RTC (Communication) channel, often everyone is set to PUBLISHER:
async function generateToken(appID, appCertificate, channelName) {
  const agoraRole = RtcRole.PUBLISHER; // Everyone can publish
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 86400; // Token valid for 1 day

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      0, // UID=0 => Agora auto-assigns a unique UID on join
      agoraRole,
      privilegeExpiredTs
    );
    console.log("Generated token:", token);
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate Agora token");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { channelName, uid, role, tutorId, scheduledClassId } = req.body;

  console.log("classId in generate-token", scheduledClassId);
  // Validate input
  if (!channelName || !uid || !role || !tutorId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }
  if (!["student", "tutor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appID || !appCertificate) {
    console.error("Agora credentials not set");
    return res
      .status(500)
      .json({ message: "Agora credentials not configured" });
  }

  try {
    // Connect to the database
    await dbConnect();

    // If the role is student, make sure the tutor is already in the channel
    // if (role === "student") {
    //   const tutorCheck = await checkIfTutorJoined(channelName);
    //   if (!tutorCheck.success) {
    //     // const response = await fetch(`${process.env.BASE_URL}/api/stop-recording`, {
    //     //   method: 'POST',
    //     //   headers: {
    //     //     "Content-Type": "application/json",
    //     //   },
    //     //   body: JSON.stringify({
    //     //     scheduledClassId:scheduledClassId,
    //     //   }),
    //     // })
    //     return res.status(400).json({
    //       message: "Tutor has not joined the call yet. Please wait.",
    //     });
    //   }
    // }

    // Fetch scheduled class for validation
    const scheduledClass = await ScheduledClasses.findById({
      _id: scheduledClassId,
    });
    if (!scheduledClass) {
      return res.status(404).json({ message: "Scheduled class not found" });
    }

    // Update channelName if not already present
    if (!scheduledClass.videos.channelName) {
      scheduledClass.videos.channelName = channelName;
      await scheduledClass.save();
    }

    // Generate Agora token for "rtc" mode
    const token = await generateToken(appID, appCertificate, channelName);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({
      message: "An error occurred while generating the token",
      error: error.message,
    });
  }
}
