import dbConnect from "../lib/mongoose"; // Import database connection utility
import Tutor from "../models/Tutor"; // Import the Tutor model

// Main handler function for the API
export default async function handler(req, res) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract query parameters from the request
    const {
      search = "", // Search string (name, subject expertise, or area of expertise)
      gender = "", // Gender filter (case-sensitive)
      level = "", // Education level filter
      availability = "", // Availability filter (comma-separated days)
      subject = "", // Topic filter (subject expertise)
      hourlyPrice = 0, // Hourly price filter (inclusive)
      experience = "", // Experience filter (comma-separated values: beginner, intermediate, experienced)
    } = req.query;

    // Initialize the filter object to store MongoDB query conditions
    let filter = {};

    
    // 1. Search: Match firstName, lastName, subjectExpertise, or areaOfSubjects ignoring spaces
if (search.trim()) {
  const searchWords = search.trim().split(/\s+/); // Split the search term into words
  const regexArray = searchWords.map((word) => new RegExp(word, "i")); // Create regex for each word, case-insensitive

  filter.$or = [
    { "tutorDetails.firstName": { $in: regexArray } }, // Match any word in first name
    { "tutorDetails.lastName": { $in: regexArray } }, // Match any word in last name
    { "subjectsTaught.subjectExpertise": { $in: regexArray } }, // Match any word in subject expertise
    { "subjectsTaught.areaOfSubjects": { $in: regexArray } }, // Match any word in area of subjects
  ];
}


    // 2. Level filter: Match the tutor's level if provided
    if (level) {
      filter["tutorDetails.level"] = level; // Match the exact level (e.g., "middleSchoolLevel")
    }

    // 3. Gender filter: Apply exact match with case normalization
    if (gender) {
      filter["tutorDetails.gender"] = gender.toLowerCase(); // Convert input gender to lowercase for exact match
    }

    // 4. Availability filter: Match if the tutor is available on all the provided days
    if (availability) {
      const availabilityArray = availability.split(","); // Split the comma-separated values into an array

      // Build the availability condition for each day
      filter["tutorDetails.availability"] = {
        $all: availabilityArray.map((day) => ({
          $elemMatch: { day: day },
        })),
      };
    }

    // 5. Subject (Topic) filter: Match the tutor's subject expertise ignoring spaces and case
    if (subject.trim()) {
      const sanitizedSubject = subject.replace(/\s+/g, ""); // Remove spaces from the subject input
      const subjectRegex = new RegExp(sanitizedSubject, "i"); // Create a case-insensitive regex for matching

      filter["subjectsTaught.subjectExpertise"] = { $regex: subjectRegex }; // Case-insensitive match on subject expertise ignoring spaces
    }

    // 6. Hourly Price filter: Get tutors whose hourly price is between 0 and the provided hourlyPrice
    if (hourlyPrice && Number(hourlyPrice) > 0) {
      filter["tutorDetails.hourlyPrice"] = {
        $gte: 0,
        $lte: Number(hourlyPrice),
      }; // Match between 0 and the provided hourlyPrice
    }

    // 7. Experience filter: Exact match for experience levels
    if (experience.trim()) {
      const experienceArray = experience
        .split(",")
        .map((exp) => exp.trim().toLowerCase()); // Split and normalize to lowercase

      filter["tutorDetails.experience"] = { $in: experienceArray }; // Match only exact values (e.g., 'beginner', 'intermediate', 'experienced')
    }

    // Fetch all tutors that match the filter criteria
    const tutors = await Tutor.find(filter);

    console.log("Tutors found: ", tutors); // Log the tutors found

    // Send the list of matching tutors to the frontend as a JSON response
    return res.status(200).json(tutors);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    // Send a 500 Internal Server Error response if something goes wrong
    return res.status(500).json({ message: "Error fetching tutors" });
  }
}
