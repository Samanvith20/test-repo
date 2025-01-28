import dbConnect from "../lib/mongoose";
import SessionRequests from "../models/SessionRequests";

export default async function handler(req, res) {
  await dbConnect();
  console.log("scheduling cron job was working perfectly");

  // Get the description parameter from the query
  const { description } = req.query;

  if (!description) {
    return res.status(400).json({ message: "Description is required" });
  }

  try {
    // Update all session requests with status "Pending" to the specified description
    const result = await SessionRequests.updateMany(
      { status: "Pending" },
      { $set: { classDescription: description } }
    );
    console.log("scheduling cron job was working perfectly");

    console.log("Result of updating session requests:", result);

    res.status(200).json({
      message: `Session requests updated with new description: ${description}`,
      modifiedCount: result.modifiedCount, // Shows how many documents were modified
    });
  } catch (error) {
    console.error("Error updating session requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
