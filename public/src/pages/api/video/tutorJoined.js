import dbConnect from "../lib/mongoose";
import ScheduledClass from "../models/ScheduledClasses";


export async function TutorJoined( channelName) {
  await dbConnect();

  // Fetch the VideoEvent document
  const scheduledClass = await ScheduledClass.findOne({ "videos.channelName": channelName });

  if (!scheduledClass) {
    console.log(`No class found  channelName: ${channelName}`);
    return false;
  }

  if (scheduledClass.videos.tutorEvents && scheduledClass.videos.tutorEvents.length > 0) {
    const tutorEvents = scheduledClass.videos.tutorEvents;

    // Sort events by timestamp descending
    tutorEvents.sort((a, b) => b.timestamp - a.timestamp);

    let latestJoinTimestamp = null;
    let latestLeaveTimestamp = null;

    for (const event of tutorEvents) {
      if (!latestJoinTimestamp && event.action === 'join') {
        latestJoinTimestamp = event.timestamp;
      }
      if (!latestLeaveTimestamp && event.action === 'leave') {
        latestLeaveTimestamp = event.timestamp;
      }
      if (latestJoinTimestamp && latestLeaveTimestamp) {
        break;
      }
    }

    console.log(`Latest join: ${latestJoinTimestamp}, Latest leave: ${latestLeaveTimestamp}`);

    if (latestJoinTimestamp) {
      if (!latestLeaveTimestamp || latestLeaveTimestamp < latestJoinTimestamp) {
        return true; // Tutor is in the call
      }
    }
  } else {
    console.log(`No tutor events  channelName: ${channelName}`);
  }

  return false; // Tutor has not joined or has left
}