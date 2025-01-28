import axios from "axios";
import ScheduledClasses from "../../models/ScheduledClasses";
import dbConnect from "../../lib/mongoose";

const APP_ID = process.env.AGORA_APP_ID;
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
const CUSTOMER_CERTIFICATE = process.env.AGORA_CUSTOMER_CERTIFICATE;

function sanitizeFileName(name) {
  // Remove all non-alphanumeric characters and truncate to 64 characters
  return name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 64);
}

export default async function handler(req, res) {
  const { channelName, uid, resourceId, scheduledClassId, token } = req.body;
  await dbConnect();

  const url = `https://api.agora.io/v1/apps/${APP_ID}/cloud_recording/resourceid/${resourceId}/mode/web/start`;
  const auth = Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_CERTIFICATE}`).toString("base64");

  const options = {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  };

  try {
    // Fetch scheduled class details
    const scheduledClass = await ScheduledClasses.findById({ _id: scheduledClassId });
    if (!scheduledClass) {
      throw new Error("Scheduled class not found");
    }

    const tutorUid = scheduledClass.videos.tutorUid;
    const studentUid = scheduledClass.videos.studentUid;

    // Sanitize names and timestamps
    const tutorName = sanitizeFileName(scheduledClass.tutorName);
    const studentName = sanitizeFileName(scheduledClass.studentUsername);
    const date = sanitizeFileName(scheduledClass.timeslot.date);
    const startTime = sanitizeFileName(scheduledClass.timeslot.time.split("-")[0]);
    const endTime = sanitizeFileName(scheduledClass.timeslot.time.split(" -")[1]);
    const classTime = `${date}${startTime}${endTime}`;

    // Construct sanitized fileNamePrefix
    const fileNamePrefix = ["recordings", classTime, tutorName, studentName];
    console.log("Constructed File Path:", fileNamePrefix.join("/"));

    const simpleUid = tutorUid + 1;

    // Construct payload
    const data = {
      cname: channelName,
      uid: simpleUid.toString(),
      clientRequest: {
        token,
        recordingConfig: {
          maxIdleTime: 600,
          transcodingConfig: {
            height: 720,
            width: 1280,
            bitrate: 2000,
            fps: 30,
            mixedVideoLayout: 1,
            backgroundColor: "#FFFFFF",
          },
        },
        extensionServiceConfig: {
          extensionServices: [
            {
              serviceName: "web_recorder_service",
              errorHandlePolicy: "error_abort",
              serviceParam: {
                url: "https://f4ab-115-98-200-101.ngrok-free.app ", // Ensure Ngrok bypasses the warning page
                audioProfile: 0,
                videoWidth: 1280,
                videoHeight: 720,
                maxRecordingHour: 3,
                maxVideoDuration: 200,
              },
            },
          ],
        },
        recordingFileConfig: {
          avFileType: ["hls", "mp4"],
        },
        region: "NA",
        // subscribeVideoUids: [tutorUid.toString(), studentUid.toString()], // Explicitly subscribing to UIDs
        // subscribeAudioUids: [tutorUid.toString(), studentUid.toString()], // Explicitly subscribing to UIDs
        storageConfig: {
          vendor: 1,
          region: 0,
          bucket: process.env.BUCKET_NAME,
          accessKey: process.env.USER_ACCESS_KEY,
          secretKey: process.env.USER_SECRET_KEY,
          fileNamePrefix, // Use sanitized and validated array
        },
      },
    };

    console.log("Payload Data:", JSON.stringify(data, null, 2));

    // Start recording
    const startResponse = await axios.post(url, data, options);
    const { sid, resourceId: responseResourceId } = startResponse.data;

    console.log("Start Recording Response:", startResponse.data);

    // Update scheduled class with recording details
    scheduledClass.videos.channelName = channelName;
    scheduledClass.videos.sid = sid;
    scheduledClass.videos.resourceId = responseResourceId;
    await scheduledClass.save();

    // Query recording status for debugging
    const queryUrl = `https://api.agora.io/v1/apps/${APP_ID}/cloud_recording/resourceid/${responseResourceId}/sid/${sid}/mode/web/query`;
    const queryResponse = await axios.get(queryUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    console.log("Query Response:", queryResponse.data);
    console.log("Extension Service State:", queryResponse.data.serverResponse.extensionServiceState);

    res.status(200).json({
      startResponse: startResponse.data,
      queryResponse: queryResponse.data,
    });
  } catch (error) {
    console.error(
      "Error starting recording:",
      error.response?.data || error.message
    );

    res.status(500).json({ error: error.message });
  }
}
