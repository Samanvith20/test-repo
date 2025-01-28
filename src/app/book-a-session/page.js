"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Poppins } from "next/font/google";
import { useSearchParams } from "next/navigation";
import moment from "moment-timezone";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
console.log("stripePublickey", process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const ConfirmSessionForm = () => {
  const stripe=useStripe()
  const router = useRouter();
  const date = new Date();
  const [studentData, setStudentData] = useState({
    name: "",
    subject: "",
    areaSubject: "",
    classDescription: "",
    classDuration: "",
    hour: "",
    date: "",
    time: "",
    tutorId: "",
    sessionType: "Online",
  });

  console.log("set", studentData);

  const searchParams = useSearchParams();
  console.log("searchParams jaffa", searchParams.size);
  const name = searchParams.get("name");
  const slotTime = searchParams.get("slotTime");
  const slotDate = searchParams.get("slotDate");
  const timezone = searchParams.get("timezone");
  const isReadOnly = searchParams.size == 4; // If size is not 4, set readOnly to true
   console.log("isReadOnly", isReadOnly);
   
  console.log(" slotTime: ", slotTime);
  console.log("NAME: ", name);
  console.log("slotDate: ", slotDate);

  const timezoneMap = {
    Alaska: "America/Anchorage",
    Hawaii: "Pacific/Honolulu",
    Eastern: "America/New_York",
    Central: "America/Chicago",
    Mountain: "America/Denver",
    Pacific: "America/Los_Angeles",
    // Add other mappings as neede
  };

  function formatDate(date) {
    const newDate = new Date(date);
    const day = String(newDate.getDate()).padStart(2, '0'); // Add leading zero if day < 10
    const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const year = newDate.getFullYear();
  
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
  }
  
  const formattedDate = studentData.date ? formatDate(studentData.date) : "";
  console.log("date",formattedDate);  // Example: "09/11/2024"
  

  const fetchData = async () => {
    try {
      const data = await fetch(
        `/api/tutors/get-session-details?name=${name}&slotTime=${slotTime}&slotDate=${slotDate}&timezone=${timezone}`
      );
      const response = await data.json();

      // Convert the date to the specified timezone using moment-timezone
      // const formattedDate = moment
      //   .tz(response.student.timeslot?.date, timezoneMap[timezone])
      //   .format("YYYY-MM-DD");

      console.log("data", response);
      setStudentData({
        _id: response.student._id,
        name: response.student.studentUsername,
        subject: response.student.subjectDetails.subject,
        areaSubject: response.student.subjectDetails.areaOfSubject,
        classDescription: response.student.classDescription,
        classDuration: response.student.classDuration,
        tutorId: response.student.tutorId,
        hour: response.tutorDetails.hourlyPrice,
        date: response.student.timeslot?.date,
        time: response.student.timeslot?.time,
        timezone: response.student.timeslot?.timezone,
        sessionType: "Online",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (name) {
      fetchData();
    }
  }, [name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!stripe) {
      console.error("Stripe.js has not loaded yet.");
      toast.error("Stripe is not ready. Please try again.");
      return;
    }
    console.log("Stripe instance:", stripe);

  
    const toastId = toast.loading("Processing...");
  
    try {
      const response = await fetch(`/api/tutors/confirm-session`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: studentData._id,
          status: "Accepted",
          studentUsername: studentData.name,
          timeslot: {
            date: studentData.date,
            time: studentData.time,
            timezone: studentData.timezone,
          },
          classDescription: studentData.classDescription,
          subjectDetails: {
            subject: studentData.subject,
            areaOfSubject: studentData.areaSubject,
          },
          classDuration: studentData.classDuration,
          tutorId: studentData.tutorId,
        }),
      });
  
      const result = await response.json();
      console.log("Confirm session result:", result);
  
      if (response.ok && result.clientSecret) {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          result.clientSecret
        );
  
        if (error) {
          console.error("Card error:", error.message);
  
          // Provide specific error messages based on error code
          switch (error.code) {
            case "card_declined":
              toast.error(
                error.decline_code === "insufficient_funds"
                  ? "Your card was declined due to insufficient funds."
                  : "Your card was declined. Please check your card details or try a different card."
              );
              break;
            case "expired_card":
              toast.error("Your card has expired. Please use a different card.");
              break;
            case "incorrect_cvc":
              toast.error("The CVC code is incorrect. Please check and try again.");
              break;
            case "processing_error":
              toast.error(
                "An error occurred while processing your card. Please try again later."
              );
              break;
            default:
              toast.error("An unexpected error occurred. Please try again or contact support.");
          }
          toast.dismiss(toastId);
          return;
        }
  
        if (paymentIntent?.status === "requires_capture") {
          toast.success("Payment authorized and session confirmed successfully!");
          console.log("PaymentIntent after authentication:", paymentIntent);
  
          setTimeout(() => {
            router.push("/tutor/tutor-dashboard");
          }, 500);
        } else {
          console.error(`Unexpected PaymentIntent status: ${paymentIntent?.status}`);
          toast.error("Unexpected payment status. Please contact support.");
        }
      } else if (!response.ok) {
        console.error("Error confirming session:", result.error);
        toast.error(result.error || "Failed to confirm session. Please try again.");
      }
      // if(response.ok){
      //   toast.remove(toastId)
      //   toast.success( response.message || " class booked successfully")
      //   setTimeout(() => {
      //           router.push("/tutor/tutor-dashboard");
      //         }, 500);

      // }else{
      //   toast.remove(toastId)
      //   toast.error(result.error || "Failed to confirm session. Please try again.");
      // }
    } catch (error) {
      console.error("Error confirming session and payment:", error.message);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      toast.dismiss(toastId);
    }
  };
  
  
  

  return (
    <div className={` ${poppins.className}`}>
      <Toaster />
      <div className="container mx-auto flex justify-between min-h-[500px] py-10 items-center px-4 sm:px-8 lg:py-[10px] lg:px-[16px] xl:px-[86px]">
        <div className="border rounded bg-[#F6F6F6] w-full my-auto mx-auto p-4 sm:p-6">

          <form
            
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:p-6 lg:grid-cols-3 gap-6   ">
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Student name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter"
                value={studentData?.name || ""}
                onChange={handleInputChange}  
                readOnly={isReadOnly} 
                className="w-full text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Subject
              </label>
              <input
  type="text"
  name="subject"
  className="w-full rounded font-normal text-[16px] px-3 py-2"
  value={studentData?.subject || ""} // Display the current subject if available
  onChange={handleInputChange}
  readOnly={isReadOnly} // Dynamically set readOnly
  placeholder="Enter subject" // Placeholder for when the input is empty
/>
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Area of Subject
              </label>
              <input
                type="text"
                name="areaSubject"
                placeholder="Enter"
                value={studentData?.areaSubject || ""}
                readOnly={isReadOnly} 
                onChange={handleInputChange}
                className="w-full text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                Duration
              </label>
              <input
                type="text"
                name="classDuration"
                placeholder="Enter"
                value={studentData?.classDuration || ""}
                readOnly={isReadOnly} 
                onChange={handleInputChange}
                className="w-full text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Hourly Rate
              </label>
              <input
                type="number"
                name="hour"
                placeholder="Eg:35"
                value={studentData?.hour || ""}
                onChange={handleInputChange}
                readOnly={isReadOnly} 
                className="w-full text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                Date
              </label>
              <input
                type="date"
                // readOnly={isReadOnly} 
                name="date"
                value={studentData.date ? formatDate(studentData.date) : ""} 
                
                onChange={handleInputChange}
                className="w-full rounded px-3 py-2 text-[16px] font-normal"
              />
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Time
              </label>
              <input
                type="text"
                // readOnly={isReadOnly} 
                name="time"
                placeholder="Enter"
                value={studentData?.time || ""}
                onChange={handleInputChange}
                className="w-full text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-[16px] md:text-[18px] font-semibold text-[#454545]">
                *Session Type
              </label>
              <input
                type="text"
                name="sessionType"
                readOnly={isReadOnly} 
                placeholder="Online"
                value={studentData?.sessionType || ""}
                onChange={handleInputChange}
                className="w-full text-[16px] font-normal rounded px-3 py-2"
              />
            </div>
            </div>

            <div className="flex  flex-col px-6  ">
              <span className=" text-[16px] md:text-[18px] font-semibold text-[#454545]">About:</span>

              {
                studentData?.classDescription ? 
                <textarea
                name="classDescription"
                placeholder="Enter class description"
                value={studentData?.classDescription || ""}
                onChange={handleInputChange}
                readOnly={isReadOnly} 
                className="w-full text-[16px] font-normal rounded px-3 py-2  text-black  h-32"
              />
              : <textarea
              name="classDescription"
              placeholder="Enter class description"
              readOnly={isReadOnly} 
              onChange={handleInputChange}
              className="w-full text-[16px] font-normal rounded px-3 py-2   text-black  h-32"
            /> 
                
              }
             
            </div>

            <div className="  py-10 text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-[#E77B3E] text-white rounded-lg text-[18px] font-semibold"
              >
                Confirm a Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Elements stripe={stripePromise}>
      <ConfirmSessionForm />
      </Elements>
    </Suspense>
  );
};

export default SuspenseWrapper;