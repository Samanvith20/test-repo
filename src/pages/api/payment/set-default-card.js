import Stripe from "stripe";
import dbConnect from "../lib/mongoose";
import Payment from "../models/Payment";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email, paymentMethodId } = req.body;

  if (!email || !paymentMethodId) {
    return res.status(400).json({ error: "Email and paymentMethodId are required." });
  }

  try {
    const paymentDetails = await Payment.findOne({ studentEmail: email });

    if (!paymentDetails || !paymentDetails.customerId) {
      return res.status(404).json({ error: "Customer not found." });
    }

    // Set the default payment method in Stripe
    await stripe.customers.update(paymentDetails.customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update the default payment method in the database
    paymentDetails.defaultPaymentMethodId = paymentMethodId;
    await paymentDetails.save();

    res.status(200).json({ message: "Default payment method set successfully." });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: "Failed to set default payment method." });
  }
}
