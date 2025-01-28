import axios from "axios";
import ScheduledClasses from "../models/ScheduledClasses";

const APP_ID = process.env.AGORA_APP_ID;

const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID; // Store in .env.local
const CUSTOMER_CERTIFICATE = process.env.AGORA_CUSTOMER_CERTIFICATE; // Store in .env.local

console.log("App ID:", APP_ID);
console.log("Customer ID:", CUSTOMER_ID);
console.log("Customer Certificate:", CUSTOMER_CERTIFICATE);

export default async function handler(req, res) {
  console.log("Acquire Recording Request:", req.body);
  const { channelName, uid,scheduledClassId } = req.body;

  const url = `https://api.agora.io/v1/apps/${APP_ID}/cloud_recording/acquire`;
  const auth = Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_CERTIFICATE}`).toString(
    "base64"
  );
     const scheduledClass=await ScheduledClasses.findById({ _id: scheduledClassId });
      const tutorUid=scheduledClass.videos.tutorUid;
    console.log("Tutor UID:", tutorUid);
    const studentUid=scheduledClass.videos.studentUid;
    console.log("Student UID:", studentUid);
  console.log("App ID:", APP_ID);
  console.log("Authorization Header:", `Basic ${auth}`);
  console.log("Request URL:", url);

  if(!APP_ID  || !CUSTOMER_ID || !CUSTOMER_CERTIFICATE) {
    console.error("Agora credentials not set");
      return res.status(500).json({ message: "Agora credentials not configured" });
}

  const options = {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  };
  // const random10DigitNumber = Math.floor(
  //   1000000000 + Math.random() * 9000000000
  // );
  let simpleUID = tutorUid + 1;
  const data = {
    cname: channelName,
    uid: simpleUID.toString(),
    clientRequest: {
      resourceExpiredHour: 24,
      scene: 1,
    },
  };

  console.log("Request Data:", data);

  try {
    const response = await axios.post(url, data, options);
    console.log("Acquire Recording Response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Acquire Recording Error:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
