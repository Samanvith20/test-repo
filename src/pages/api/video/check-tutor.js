import ScheduledClass from "../models/ScheduledClasses"; 
import dbConnect from "../lib/mongoose";

export  async function checktutor(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { channelName } = req.body;
    if (!channelName) {
      return res.status(400).json({ message: 'Channel name is required.' });
    }

    try {
      const scheduledClass = await ScheduledClass.findOne({ "videos.channelName": channelName });
      if (!scheduledClass) {
        return res.status(404).json({ message: 'Channel not found.' });
      }

      // Check the latest tutor action in the videos field
      const tutorLeft = scheduledClass.videos.tutorEvents.some(
        (event) => event.action === 'leave'
      );

      // Return whether the tutor is still present
      return res.status(200).json({ tutorPresent: !tutorLeft });
    } catch (error) {
      console.error('Error checking tutor presence:', error);
      return res.status(500).json({ message: 'Error checking tutor presence.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
