import axios from "axios";
import ScheduledClasses from "../../models/ScheduledClasses";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
const CUSTOMER_CERTIFICATE = process.env.AGORA_CUSTOMER_CERTIFICATE;

export default async function handler(req, res) {
  const { scheduledClassId } = req.body;

  try {
    // Fetch Scheduled Class details
    const scheduledClass = await ScheduledClasses.findById({ _id: scheduledClassId });
    if (!scheduledClass) {
      throw new Error("Scheduled class not found");
    }

    const { tutorUid, studentUid, channelName, resourceId, sid } = scheduledClass.videos;

    console.log("Tutor UID:", tutorUid);
    console.log("Student UID:", studentUid);
    console.log("App ID:", APP_ID);

    const auth = Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_CERTIFICATE}`).toString("base64");

    const stopUrl = `https://api.agora.io/v1/apps/${APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/web/stop`;

    const options = {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    };

    const data = {
      cname: channelName,
      uid: (tutorUid + 1).toString(), // Adjusted UID
      clientRequest: {},
    };

    console.log("Payload Data:", JSON.stringify(data, null, 2));

    // Stop Recording API Call
    const response = await axios.post(stopUrl, data, options);

    console.log("Stop Recording Response:", response.data);

    const { serverResponse } = response.data;
    if (!serverResponse || !serverResponse.extensionServiceState) {
      throw new Error("No extension service state found in server response");
    }
     console.log("Server Response:", serverResponse.extensionServiceState);
    // Extract file URLs from extension service state
    const fileUrls = [];
    serverResponse.extensionServiceState.forEach((service) => {
      console.log("Service Name:", service.serviceName);
      if (service.serviceName === "web_recorder_service" && service.payload.fileList) {
         console.log("File List:", service.payload.fileList);
        service.payload.fileList.forEach((file) => {
          if (file.filename.endsWith(".mp4")) {
            const fileUrl = `https://edueliteconnect.s3.us-east-1.amazonaws.com/${file.filename}`;
            fileUrls.push(fileUrl);
          }
        });
      }
    });

    if (fileUrls.length > 0) {
      console.log("Extracted File URLs:", fileUrls);
      scheduledClass.videoRecordingUrl.push(...fileUrls);
      await scheduledClass.save();
    } else {
      console.log("No file URLs found in server response");
    }

    res.status(200).json({
      message: "Recording stopped successfully",
      fileUrls,
    });
  } catch (error) {
    console.error(
      "Error stopping recording:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}
