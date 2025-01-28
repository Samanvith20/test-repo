// components/PaymentMethodForm.js
"use client";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';



const PaymentMethodForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
 
  const email = session?.user?.email;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(""); 
  console.log("clientSecret: ", clientSecret);
  
  const [error, setError] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [cardId, setCardId] = useState(null);
  const [defaultCardId, setDefaultCardId] = useState(null);
  console.log("savedCards: ", savedCards);
  
  // Function to fetch saved cards and default card
  const fetchSavedCards = async () => {
    try {
      const response = await fetch('/api/payment/saved-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) 
      });
      const data = await response.json();
      console.log('Fetched saved cards:', data);
      
      setSavedCards(data.paymentMethods);
      setDefaultCardId(data.defaultPaymentMethodId);
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      toast.error('Failed to fetch saved cards.');
    }
  };
  const fetchSetupIntent = async () => {
    try {
      const response = await fetch('/api/payment/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) 
      });
      const data = await response.json();
      setClientSecret(data?.clientSecret);
    } catch (error) {
      console.error('Error creating SetupIntent:', error);
      toast.error('Failed to initialize payment method.');
    }
  };
  // useEffect(() => {
  //   if (showPaymentForm) {
  //     const fetchSetupIntent = async () => {
  //       try {
  //         const response = await fetch('/api/payment/create-setup-intent', {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({ email }) 
  //         });
  //         const data = await response.json();
  //         setClientSecret(data?.clientSecret);
  //       } catch (error) {
  //         console.error('Error creating SetupIntent:', error);
  //         toast.error('Failed to initialize payment method.');
  //       }
  //     };
  //     fetchSetupIntent();
  //   }
  // }, []);

  // Fetch saved cards when component loads
  useEffect(() => {
    if (email) {
      fetchSetupIntent();     
      fetchSavedCards();
    }
  }, [email]);

  const handleAddPaymentClick = () => {
    setShowPaymentForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (!stripe || !elements || !clientSecret) {
      toast.error('Stripe has not loaded correctly.');
      setLoading(false);
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
  
    // Confirm the card setup using the clientSecret
    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${firstName} ${lastName}`,
        },
      },
    });
  
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
  
    if (setupIntent.status === 'succeeded') {
      toast.success('Payment method saved successfully!');
      console.log('SetupIntent succeeded:', setupIntent);
  
      // Optionally, call your backend API to save the setupIntent ID or associate the payment method with the user.
      setShowPaymentForm(false);
      fetchSavedCards();
    } else {
      toast.error('Failed to save payment method.');
    }
  
    setLoading(false);
  };
  

  const removeCard = async (paymentMethodId) => {
    try {
      const response = await fetch('/api/payment/remove-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId, email }), // Send the paymentMethodId and email to the backend
      });
  
      const data = await response.json();
      console.log('Remove card response:', data);
      
      if (response.ok) {
        toast.success('Card removed successfully.');
        return true; // Card successfully removed
      } else {
        toast.error(`Failed to remove the card: ${data.error}`);
        return false; // Card removal failed
      }
      
    } catch (error) {
      toast.error('Error occurred while removing the card.');
      console.error(error);
      return false;
    }
  };

  const handleRemove = async (paymentMethodId) => {
    setLoading(true);
    const isRemoved = await removeCard(paymentMethodId);
    if (isRemoved) {
      // Update the state to remove the card from the UI
      setSavedCards(prevCards => prevCards.filter(card => card.paymentId !== paymentMethodId));

      // If removed card was default, reset defaultCardId
      if (defaultCardId === paymentMethodId) {
        setDefaultCardId(null);
        // Optionally, set another card as default
        if (savedCards.length > 1) { // Because one card has been removed
          const newDefault = savedCards.find(card => card.paymentId !== paymentMethodId);
          if (newDefault) {
            handleCardSelection(newDefault.paymentId);
          }
        }
      }
    }
    setLoading(false);
  };

  const handleCardSelection = async (id) => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/set-default-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, paymentMethodId: id }),
      });
      const data = await response.json();
      if (response.ok) {
        setDefaultCardId(id);
        toast.success('Default payment method updated successfully!');
      } else {
        toast.error(`Failed to set default payment method: ${data.error}`);
      }
    } catch (error) {
      toast.error('Error setting default payment method.');
      console.error(error);
    }
    setLoading(false);
  };

  // Function to get card image URL dynamically from CDN
  const getCardImageURL = (brand) => {
    const brandMapping = {
      visa: "https://cdn.simpleicons.org/visa/blue",
      mastercard: "https://cdn.simpleicons.org/mastercard/red",
      amex: "https://cdn.simpleicons.org/americanexpress/blue",
      discover: "https://cdn.simpleicons.org/discover/orange",
      // Add more brands here
    };
  
    return brandMapping[brand.toLowerCase()] || "https://cdn.simpleicons.org/credit-card/black";
  };

  const handleAuthorizePayment = async (amount) => {
    try {
      const response = await fetch('/api/payment/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount }),
      });
  
      const data = await response.json();
      console.log('Authorization response:', data);
  
      if (response.ok) {
        if (data.clientSecret) {
          // Handle 3D Secure authentication
          const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret);
  
          if (error) {
            console.error('Authentication error:', error.message);
            toast.error('Authentication failed. Please try again.');
            return;
          }
  
          if (paymentIntent.status === 'requires_capture') {
            toast.success('Payment authorized successfully!');
            console.log('PaymentIntent after authentication:', paymentIntent);
            // Store `paymentIntent.id` for later capture
          } else {
            console.error(`Unexpected status after authentication: ${paymentIntent.status}`);
            toast.error('Unexpected status. Please contact support.');
          }
        } else {
          console.error('Missing client_secret in response:', data);
          toast.error('Authorization failed. No client_secret provided.');
        }
      } else {
        toast.error(data.error || 'Failed to authorize payment.');
      }
    } catch (error) {
      console.error('Error authorizing payment:', error.message);
      toast.error('Failed to authorize payment. Please try again.');
    }
  };
  
  
  
  

  const capturePayment = async () => {
    try {
      const response = await fetch('/api/payment/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log('Capture payment response:', data);
      if (response.ok) {
        toast.success('Payment captured successfully!');
      } else {
        toast.error(`Failed to capture payment: ${data.error}`);
      }
    }catch(error){

      console.error(error);
    }
  }

  // const handlePayAmountClick = async (amount) => {
  //   if (!cardId) {
  //     toast.error('Please select a payment method.');
  //     return;
  //   }

  //   console.log('Payment Amount:', amount);
  //   try {
  //     const response = await fetch('/api/payment/pay-amount', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, amount, cardId }) 
  //     });
  //     const data = await response.json();
  //     console.log('Payment response:', data);
  //     if (response.ok) {
  //       toast.success('Payment successful!');
  //     } else {
  //       toast.error(`Payment failed: ${data.error}`);
  //     }
  //   } catch (error) {
  //     console.error('Error processing payment:', error);
  //     toast.error('Error processing payment.');
  //   }
  // }

  return (
    <>
    <Toaster/>
      {/* Display saved cards */}
      {!showPaymentForm && savedCards?.length > 0 && (
        savedCards.map((card) => (
          <div key={card.paymentId} className="p-4 border rounded-md flex items-center gap-4 mt-12">
            {/* Dynamically load card brand image */}
            <Image
              src={getCardImageURL(card.brand)} 
              width={61}
              height={55}
              alt={card.brand}
              quality={100}
              unoptimized
            />
            <div className="flex-1">
              <p className="font-semibold text-[15px]">{card.brand} | .......{card.last4}</p>
              <p className="text-sm font-semibold">Expires: {card.exp_month}/{card.exp_year}</p>
              {defaultCardId === card.paymentId && <span className="text-green-500 text-xs">Default</span>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="selectedCard"
                checked={defaultCardId === card.paymentId}
                onChange={() => handleCardSelection(card.paymentId)} // Allow selecting this card as default
              />
              <button
                className="text-[#1E8D8F] font-semibold text-[15px]"
                onClick={() => handleRemove(card.paymentId)}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}

      {/* Payment form to add a new card */}
      {showPaymentForm && (
        <div className='border rounded bg-white h-[74%] mt-20'>
          <h2 className="text-[20px] font-bold text-center mb-3 mt-6">
            Add Payment Method
          </h2>
          <p className="text-[15px] font-medium text-center">
            Add a payment method to ensure tutors know you're all set to book a lesson.
          </p>
          <form onSubmit={handleSubmit} className='mx-5'>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4 mt-8">
              <div>
                <label className="text-[15px] font-semibold">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="mt-1 text-[12px] font-normal w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-[15px] font-semibold">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="mt-1 text-[12px] font-normal w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* Stripe's CardElement for secure card entry */}
            <div className="mb-4">
              <label className="text-[15px] font-semibold">Card Details</label>
              <CardElement className="mt-1 text-[12px] font-normal w-full px-3 py-2 border rounded-md" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E77B3E] mb-3 text-white font-bold py-2 px-4 rounded-md"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        </div>
      )}

      {!showPaymentForm && (
        <div className='flex justify-between'>
          <button
            onClick={handleAddPaymentClick}
            className="text-[#1E8D8F] font-semibold text-[15px] mt-4"
          >
            Add Another Payment Method
          </button>
          {/* <button
            onClick={capturePayment}
            className="text-[#1E8D8F]  cursor-pointer font-semibold text-[15px] mt-4"
            >
              Capture Amount
            </button>
          <button
            onClick={() => handleAuthorizePayment(50)}
            className="text-[#1E8D8F] cursor-pointer font-semibold text-[15px] mt-4"
            // disabled={!cardId} // Disable if no card selected
          >
            Pay Amount
          </button> */}
        </div>
      )}
    </>
  );
};

export default PaymentMethodForm;
