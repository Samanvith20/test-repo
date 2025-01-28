import Stripe from "stripe";
import dbConnect from "../lib/mongoose";
import Payment from "../models/Payment";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export default async function handler(req, res) {
//   await dbConnect();

//   if (req.method === "POST") {
//     const { email, amount, cardId } = req.body;

//     // Fetch the payment details from the database based on student email
//     const paymentDetails = await Payment.findOne({ studentEmail: email });

//     if (!paymentDetails || !paymentDetails.customerId) {
//       return res.status(404).json({ error: "Customer not found." });
//     }

//     const { customerId } = paymentDetails;

//     try {
//       // Create a PaymentIntent with Stripe using the saved payment method
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: amount * 100, // Amount in cents
//         currency: "usd",
//         customer: customerId, 
//         payment_method: cardId, // The saved payment method (credit card)
//         setup_future_usage: 'off_session', // Off-session payment
//         confirm: true, // Automatically confirms the PaymentIntent
//         description: "Tutoring session payment",
//         automatic_payment_methods: {
//           enabled: true,
//           allow_redirects: "never", // Disallow payment methods that require redirects
//         },
//       });

//       console.log("PaymentIntent created:", paymentIntent);

//       // Get Unix timestamp and convert it to a Date object
//       const unixTimestamp = paymentIntent.created;
//       const paymentDate = new Date(unixTimestamp * 1000); // Multiply by 1000 to convert to milliseconds
//      console.log("paymentDate: ", paymentDate);
     

//       // Store transaction details
//       paymentDetails.transcationDetails = {
//         date: paymentDate, // Store as a Date object
//         id: paymentIntent.id,
//         amount: paymentIntent.amount,
//       };

//       // Save updated payment details
//       await paymentDetails.save();

//       // Return success response
//       return res.status(200).json({ success: true, paymentIntent });

//     } catch (error) {
//       console.error("Payment failed:", error); 
//       return res.status(500).json({ error: error.message });
//     }
//   } else {
//     return res.status(405).json({ error: "Method not allowed." });
//   }
// }




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email, amount, cardId } = req.body;

  if (!email || !amount || !cardId) {
    return res.status(400).json({ error: "Email, amount, and cardId are required." });
  }

  try {
    const paymentDetails = await Payment.findOne({ studentEmail: email });

    if (!paymentDetails || !paymentDetails.customerId) {
      return res.status(404).json({ error: "Customer not found." });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd', // Change to your currency
      customer: paymentDetails.customerId,
      payment_method: cardId,
      off_session: true,
      confirm: true,
    });

    res.status(200).json({ message: "Payment successful.", paymentIntent });
  } catch (error) {
    console.error('Error processing payment:', error);

    if (error.type === 'StripeCardError') {
      // Display error.message to your user
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to process payment." });
    }
  }
}
