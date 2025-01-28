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

  const { paymentMethodId, email } = req.body;

  if (!paymentMethodId || !email) {
    return res.status(400).json({ error: "paymentMethodId and email are required." });
  }

  try {
    const paymentDetails = await Payment.findOne({ studentEmail: email });

    if (!paymentDetails || !paymentDetails.customerId) {
      return res.status(404).json({ error: "Customer not found." });
    }

    // Detach the payment method from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Remove the card from the database
    paymentDetails.cards = paymentDetails.cards.filter(card => card.paymentId !== paymentMethodId);

    // If the removed card was the default, set another card as default
    if (paymentDetails.defaultPaymentMethodId === paymentMethodId) {
      if (paymentDetails.cards.length > 0) {
        paymentDetails.defaultPaymentMethodId = paymentDetails.cards[0].paymentId;
        await stripe.customers.update(paymentDetails.customerId, {
          invoice_settings: {
            default_payment_method: paymentDetails.defaultPaymentMethodId,
          },
        });
      } else {
        paymentDetails.defaultPaymentMethodId = null;
      }
    }

    await paymentDetails.save();

    res.status(200).json({ message: "Payment method removed successfully." });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: "Failed to remove payment method." });
  }
}
