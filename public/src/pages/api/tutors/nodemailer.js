import nodemailer from "nodemailer";
async function sendVerificationEmail(tutorEmail, token) {
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your preferred service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tutorEmail,
      subject: "Verify your email for EduEliteConnect",
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${process.env.BASE_URL}/tutor-email-verification?token=${token}">Verify Email</a>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  }
  export default sendVerificationEmail