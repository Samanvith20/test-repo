import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const generatesdktoken = await axios.post(
      "https://api.netless.link/v5/tokens/teams",
      {
        accessKey: process.env.NEXT_PUBLIC_WHITEBOARD_ACCESSKEY,
        secretAccessKey: process.env.NEXT_PUBLIC_WHITEBOARD_SECRETKEY,
        lifespan: 0,
        role: "admin",
      },
      {
        headers: {
          "Content-Type": "application/json",

          region: "us-sv",
        },
      }
    );
    console.log("Generated SDK token:", generatesdktoken?.data);
    return res.status(200).json(generatesdktoken?.data);
  } catch (error) {
    console.error("Error generating SDK token:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while generating the SDK token" });
  }
}
