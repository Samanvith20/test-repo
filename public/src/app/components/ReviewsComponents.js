import React, { useEffect, useState } from "react";
import { RiStarSFill } from "react-icons/ri";
import { Poppins } from "next/font/google";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ReviewsPopUp = ({ tutorId }) => {
  const [rating, setRating] = useState(0); // State for rating (clicked)
  const [hoverRating, setHoverRating] = useState(0); // State for rating (hover)
  const [reviewText, setReviewText] = useState(""); // State for review text
  const { data: session } = useSession();
  // console.log("SESSION: ", session);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if((session && session?.role !== 'student') || !tutorId){
      router.push('/')
    }
  }, [])


  const handleRatingClick = (index) => {
    setRating(index + 1); // Set the rating based on the clicked star
  };

  const handleRatingHover = (index) => {
    setHoverRating(index + 1); // Set hover rating when hovering over stars
  };

  const handleRatingHoverLeave = () => {
    setHoverRating(0); // Reset hover rating when mouse leaves the stars
  };

  const handleReviewTextChange = (event) => {
    setReviewText(event.target.value); // Update the review text
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const toastId = toast.loading("Sending Review...");
     if(!rating){
      toast.error("Please select a rating", { id: toastId });
      return;
     }

     if(!reviewText){
      toast.error("Please enter a review", { id: toastId });
      return;
     }
    try {
      const response = await fetch("/api/student/add-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          reviewContent: reviewText,
          studentUsername: session?.username,
          tutorId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review sent successfully", { id: toastId });
        setRating(0);
        setHoverRating(0);
        setReviewText("");
      } else {
        toast.error(
          data?.message || "There was an error while sending the review",
          {
            id: toastId,
          }
        );
      }

      setTimeout(()=> {
        router.push('/')
      }, 3000)

    } catch (error) {
      console.error("Error while storing the review:", error);
      toast.error("An unexpected error occurred. Please try again later.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="w-[50%] mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <Toaster />
      <form onSubmit={handleSubmit} className={`${poppins.className}`}>
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Add a Review
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <p>Rating</p>
          <ul className="flex gap-2">
            {Array(5)
              .fill()
              .map((_, index) => (
                <li key={index}>
                  <RiStarSFill
                    className={`cursor-pointer hover:text-yellow-500 ${
                      index + 1 <= hoverRating || index + 1 <= rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    } text-2xl`}
                    onClick={() => handleRatingClick(index)}
                    onMouseEnter={() => handleRatingHover(index)}
                    onMouseLeave={handleRatingHoverLeave}
                  />
                </li>
              ))}
          </ul>
        </div>

        <div className="mb-4">
          <textarea
            className="w-full p-2 border resize-none outline-primary-400 border-gray-300 rounded-md"
            placeholder="Share Your Thoughts On The Tutor"
            value={reviewText}
            onChange={handleReviewTextChange}
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-400 text-white outline-secondary-600 py-2 rounded-md hover:bg-primary-500"
        >
          Add a Review
        </button>
      </form>
    </div>
  );
};
