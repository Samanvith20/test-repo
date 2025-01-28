import Stripe from 'stripe';
import Payment from '../models/Payment';
import dbConnect from '../lib/mongoose';
import Student from '../models/Student';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const sendEmail = async (to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or use any other email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: `"EduEliteConnect" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: message, // Use HTML for email content
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if(req.method == 'POST') {

  const { studentUsername, duration, HourlyRate } = req.body;
  console.log("duration", duration);
  console.log("HourlyRate", HourlyRate);
  

  if (!studentUsername || !duration || !HourlyRate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const student = await Student.findOne({ username: studentUsername });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const email = student.email;
    const paymentDetails = await Payment.findOne({ studentEmail: email });

    if (!paymentDetails || !paymentDetails.defaultPaymentMethodId) {
      await sendEmail(
        email,
        'Payment Authorization Failed',
        `<p>Dear ${studentUsername},</p>
         <p>We were unable to find your default payment method. Please update your payment details and try again.</p>
         <p>Thank you,</p>
         <p>Your App Team</p>`
      );
      return res.status(404).json({ error: 'Payment details not found.' });
    }

    const cardId = paymentDetails.defaultPaymentMethodId;

    // Verify that the payment method belongs to the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: paymentDetails.customerId,
      type: 'card',
    });

    const isCardValid = paymentMethods.data.some((card) => card.id === cardId);
    if (!isCardValid) {
      await sendEmail(
        email,
        'Invalid Payment Method',
        `<p>Dear ${studentUsername},</p>
         <p>Your default payment method is invalid. Please update your payment details and try again.</p>
         <p>Thank you,</p>
         <p>Your App Team</p>`
      );
      return res.status(400).json({ error: 'Invalid payment method for this customer.' });
    } 
    
    
    
    
  // Parse HourlyRate as a number
  const parsedHourlyRate = Number(HourlyRate);

  // Extract numeric part from the duration string
  const parsedDuration = Number((duration.match(/\d+/) || [])[0]);

  console.log('Parsed HourlyRate:', parsedHourlyRate, 'Type:', typeof parsedHourlyRate);
  console.log('Parsed Duration:', parsedDuration, 'Type:', typeof parsedDuration);

  // Validate parsed numbers
  if (isNaN(parsedHourlyRate) || isNaN(parsedDuration) || parsedHourlyRate <= 0 || parsedDuration <= 0) {
    return res.status(400).json({ error: 'HourlyRate or duration is invalid.' });
  }

  // Calculate amount
  const amount = Math.round(parsedHourlyRate * 2 * parsedDuration);
  console.log('Calculated Amount:', amount);

     
    // Create a PaymentIntent with manual capture for authorization
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: 'usd',
      payment_method: cardId,
      customer: paymentDetails.customerId,
      confirmation_method: 'automatic',
      capture_method: 'manual', // Authorization only
      description: `Authorization for student ${email} to book a class.`,
      payment_method_types: ['card'],
    });
    console.log('PaymentIntent:', paymentIntent);

    // Confirm the PaymentIntent
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
    console.log('Confirmed PaymentIntent:', confirmedIntent);
    const authorizedAmount = amount; 

    // Save PaymentIntent details and authorized amount to the database
    const transaction = {
      date: new Date(),
      paymentIntentId: confirmedIntent.id,
      authorizedAmount, // In dollars
      capturedAmount: 0, // Initially, nothing is captured
      transcations: [`Payment authorized for $${authorizedAmount}`],
    };
    
    paymentDetails.transcationDetails = paymentDetails.transcationDetails || [];
    paymentDetails.transcationDetails.push(transaction);
    
  
    paymentDetails.paymentStatus = confirmedIntent.status;
    await paymentDetails.save();

    await sendEmail(
      email,
      'Payment Authorization Successful',
      `<p>Dear ${studentUsername},</p>
       <p>Your payment authorization for booking the class was successful. The amount of $${amount} has been authorized.</p>
       <p>Thank you,</p>
       <p>Your App Team</p>`
    );

    return res.status(200).json({
      message: 'Authorization requires confirmation.',
      clientSecret: paymentIntent.client_secret, // Send client_secret
      nextAction: paymentIntent.next_action,
    });
  } catch (error) {
    if (error.type === 'StripeCardError') {
      const student= await Student.findOne({ username: studentUsername });
      const declineCode = error.decline_code || 'unknown_reason';
      const errorMessage =
        declineCode === 'insufficient_funds'
          ? 'Your card was declined due to insufficient funds.'
          : `Your card was declined. Reason: ${declineCode}`;

      console.error('Detailed Error:', errorMessage);
    
      await sendEmail(
        student.email,
        'Payment Authorization Failed',
        `<p>Dear ${student.username},</p>
         <p>Your payment authorization failed due to the following reason:</p>
         <p><b>${errorMessage}</b></p>
         <p>Please update your payment details and try again.</p>
         <p>Thank you,</p>
         <p>Your App Team</p>`
      );
      return res.status(400).json({ error: errorMessage });
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}else{
   return res.setHeader('Allow', ['POST']);
   return res.status(405).end(`Method ${req.method} Not Allowed`);
}
}

