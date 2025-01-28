import ScheduledClasses from "../models/ScheduledClasses";
import CompletedClasses from "../models/CompletedClasses";

// Function to move completed classes to CompletedClasses
export default async function transferCompletedClasses() {
  try {
    // Find all classes where 'valid' is false
    const completedClasses = await ScheduledClasses.find({
      "videos.valid": false,
    });

    // Loop over each completed class
    for (const scheduledClass of completedClasses) {
      // Create a new entry in CompletedClasses with the data from ScheduledClasses
      const newCompletedClass = new CompletedClasses({
        studentUsername: scheduledClass.studentUsername,
        studentFullname: scheduledClass.studentFullname,
        tutorId: scheduledClass.tutorId,
        tutorProfilePicture: scheduledClass.tutorProfilePicture,
        tutorName: scheduledClass.tutorName,
        timeslot: scheduledClass.timeslot,
        classDescription: scheduledClass.classDescription,
        subjectDetails: scheduledClass.subjectDetails,
        classDuration: scheduledClass.classDuration,
        acceptedTimestamp: scheduledClass.acceptedTimestamp,
        cancellationTime: scheduledClass.cancellationTime,
        isCancelled: scheduledClass.isCancelled,
        videoUrlArray: scheduledClass.videoUrlArray,
        videos: scheduledClass.videos,
      });

      // Save the new completed class document
      await newCompletedClass.save();

      // Optionally, remove the class from ScheduledClasses
      await ScheduledClasses.deleteOne({ _id: scheduledClass._id });
    }

    console.log("Completed classes transferred successfully.");
  } catch (error) {
    console.error("Error transferring completed classes:", error);
  }
}

// Call the transfer function
transferCompletedClasses();
