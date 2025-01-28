import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import dbConnect from "../lib/mongoose";
import Student from "../models/Student";
import bcrypt from "bcrypt";
import Tutor from "../models/Tutor";

async function studentLoginWithPassword(credentials) {
  try {
    console.log("API HHIT");

    await dbConnect();
    console.log("DB CONNECTED");

    const student = await Student.findOne({ username: credentials.username });
    if (!student) {
      console.log("Student not found");
      throw new Error("Wrong Credentials");
    }

    const isCorrect = await bcrypt.compare(
      credentials.password,
      student.password
    );
    if (!isCorrect) {
      console.log("Password incorrect");
      throw new Error("Wrong Credentials");
    }

    return student;
  } catch (error) {
    console.error("Error in studentLoginWithPassword: ", error);
    throw error;
  }
}

// Function for tutor login with password
async function tutorLoginWithPassword(credentials) {
  await dbConnect();

  const tutor = await Tutor.findOne({ email: credentials.email });
  if (!tutor) throw new Error("Wrong Credentials");

  const isCorrect = await bcrypt.compare(credentials.password, tutor.password);
  if (!isCorrect) throw new Error("Wrong Credentials");

  if (!tutor.isValidated) throw new Error("Account not approved");

  return tutor;
}

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "student_credentials", // Unique ID for student login
      name: "student_credentials",
      credentials: {},
      async authorize(credentials) {
        console.log("Authorize function hit, Credentials:", credentials); // Add logging here

        try {
          const student = await studentLoginWithPassword(credentials);
          if (student) {
            return {
              id: student._id,
              username: student.username,
              email: student.email,
              role: "student", // Adding a role for differentiation
            };
          }
          return null;
        } catch (error) {
          console.error("Authorization Error:", error.message);
          return null;
        }
      },
    }),

    // New Tutor Credentials Provider
    CredentialsProvider({
      id: "tutor_credentials", // Unique ID for tutor login
      name: "tutor_credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          const tutor = await tutorLoginWithPassword(credentials);
          if (!tutor.isValidated) {
            return null;
          }
          if (tutor) {
            return {
              id: tutor._id,
              username: tutor.username,
              email: tutor.email,
              role: "tutor", // Adding a role for differentiation
            };
          }

          return null;
        } catch (error) {
          console.error("Authorization Error:", error.message);
          return null;
        }
      },
    }),

    // Google Provider for Students
    GoogleProvider({
      id: "google_student",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      async profile(profile) {
        console.log("Received Google Profile:", profile);

        try {
          await dbConnect();

          const student = await Student.findOne({ email: profile.email });

          if (student) {
            console.log("Existing student found:", student);
            return {
              id: student._id,
              username: student.username,
              email: student.email,
              role: "student",
            };
          } else {
            const newStudent = new Student({
              username: profile.email.split("@")[0],
              email: profile.email,
            });
            await newStudent.save();

            console.log("New student created:", newStudent);
            return {
              id: newStudent._id,
              username: newStudent.username,
              email: newStudent.email,
              role: "student",
            };
          }
        } catch (error) {
          console.error("Error in Google profile function:", error);
          throw new Error("Profile creation failed");
        }
      },
    }),

    // Google Provider for Tutors
    GoogleProvider({
      id: "google_tutor", // Unique ID for tutor Google login
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      async profile(profile) {
        console.log("Google Tutor Profile: ", profile);
        await dbConnect(); // Ensure connection to DB

        // Check if the user exists as a tutor
        const tutor = await Tutor.findOne({ email: profile.email });
        if (!tutor.isValidated) {
          return new Error("Tutor not approved.");
        }
        if (tutor) {
          return {
            id: tutor._id,
            username: tutor.username,
            email: tutor.email,
            role: "tutor", // Assign tutor role if tutor is found
          };
        } else {
          // Throwing an error that will be caught by NextAuth and sent to the frontend
          throw new Error("No tutor account associated with this email.");
        }
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,

      async profile(profile) {
        //  console.log("Google Profile: ", profile);
        try {
          await dbConnect();

          if (!profile.email) {
            throw new Error("email required");
          }
          const student = await Student.findOne({ email: profile?.email });
          // console.log("student", student);

          if (!student) {
            const newStudent = new Student({
              username: profile?.email?.split("@")[0],
              email: profile?.email,
            });
            await newStudent.save();
            // console.log("newStudent", newStudent);
            return {
              id: newStudent._id,
              username: newStudent.username,
              email: newStudent.email,
            };
          }
          // Return the student info
          return student;
        } catch (error) {
          console.error("Authorization Error:", error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.email = user.email;
        token.id = user.id;
        token.role = user.role;
      }
      // console.log("Token in jwt callback:", token);
      return token;
    },
    async session({ session, token }) {
      session.username = token.username;
      session.email = token.email;
      session.id = token.id;
      session.role = token.role;
      // console.log("Session in session callback:", session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export default handler;
