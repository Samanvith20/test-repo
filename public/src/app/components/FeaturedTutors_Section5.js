"use client";
import { useState, useEffect, useRef } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

const tutors = [
  {
    id: 1,
    imageUrl: "/images/landing-page-section-5-tutor-1.png",
    name: "Priyansh Kumar",
    subject: "Mathematics Tutor 1",
    desc: "Specializes in algebra, calculus, and geometry. Our tutor simplifies complex concepts....",
    experience: "3 years Experience",
    cardBgColor: "rgba(240, 244, 195, 0.5)", // Light Green Background with 50% transparency
    subjectColor: "#33691e", // Dark Green for subject
    buttonColor: "rgba(124, 179, 66, 0.5)", // Green for button with 50% transparency
  },
  {
    id: 2,
    imageUrl: "/images/landing-page-section-5-tutor-2.png",
    name: "Vaishnavi",
    subject: "Biology Tutor 2",
    desc: "Covers cell biology, genetics, and human anatomy...",
    experience: "2 years Experience",
    cardBgColor: "rgba(243, 229, 245, 0.5)", // Light Purple Background with 50% transparency
    subjectColor: "#6a1b9a", // Dark Purple for subject
    buttonColor: "rgba(156, 39, 176, 0.5)", // Purple for button with 50% transparency
  },
  {
    id: 3,
    imageUrl: "/images/landing-page-section-5-tutor-3.png",
    name: "Faheem, Md",
    subject: "Physics Tutor 3",
    desc: "Expert in mechanics, thermodynamics, and electromagnetism...",
    experience: "5 years Experience",
    cardBgColor: "rgba(225, 245, 254, 0.5)", // Light Blue Background with 50% transparency
    subjectColor: "#0288d1", // Dark Blue for subject
    buttonColor: "rgba(3, 169, 244, 0.5)", // Blue for button with 50% transparency
  },
  {
    id: 4,
    imageUrl: "/images/landing-page-section-5-tutor-4.png",
    name: "Priya Sharma",
    subject: "Physics Tutor 4 ",
    desc: "Expert in mechanics, thermodynamics, and electromagnetism...",
    experience: "3 years Experience",
    cardBgColor: "rgba(255, 236, 179, 0.5)", // Light Yellow Background with 50% transparency
    subjectColor: "#f57f17", // Dark Yellow/Orange for subject
    buttonColor: "rgba(255, 179, 0, 0.5)", // Yellow for button with 50% transparency
  },
  {
    id: 5,
    imageUrl: "/images/landing-page-section-5-tutor-5.png",
    name: "Rahul Gupta",
    subject: "Biology Tutor 5 ",
    desc: "Known for breaking down intricate details into digestible lessons...",
    experience: "4 years Experience",
    cardBgColor: "rgba(255, 235, 238, 0.5)", // Light Red Background with 50% transparency
    subjectColor: "#d32f2f", // Dark Red for subject
    buttonColor: "rgba(244, 67, 54, 0.5)", // Red for button with 50% transparency
  },
  {
    id: 6,
    imageUrl: "/images/landing-page-section-5-tutor-3.png",
    name: "Mathew",
    subject: "Physics Tutor 6",
    desc: "Expert in mechanics and thermodynamics...",
    experience: "7 years Experience",
    cardBgColor: "rgba(232, 245, 233, 0.5)", // Light Green Background with 50% transparency
    subjectColor: "#388e3c", // Dark Green for subject
    buttonColor: "rgba(76, 175, 80, 0.5)", // Green for button with 50% transparency
  },
];

const TutorCard = ({ tutor, scale }) => {
  return (
    <div
      className={`flex flex-col w-[70%] lg:w-[525px] lg:h-[225px]  md:flex-row md:w-full h-full py-4 px-4 lg:py-2 lg:px-4 lg:p-4 items-center rounded-lg shadow-lg transition-transform duration-500 ease-in-out ${
        scale ? "scale-105" : "scale-100"
      }`}
      style={{ backgroundColor: tutor.cardBgColor }} // Use the cardBgColor property
    >
      <div className="flex flex-col w-full md:w-[35%] items-center gap-2">
        <Image
          src={tutor.imageUrl}
          width={80}
          height={100}
          alt="Tutor Images"
          priority
          unoptimized
          className="rounded-md"
        />
        <div className="mt-2 md:mt-auto text-center">
          <p className="text-[12px] text-gray-600 font-semibold">{tutor.name}</p>
          <p className="text-[12px] text-gray-500">{tutor.experience}</p>
        </div>
      </div>

      <div className="flex flex-col w-full md:w-[65%] mt-4 md:mt-0">
        <h3
          className="text-lg font-semibold text-center md:text-left"
          style={{ color: tutor.subjectColor }} // Use the subjectColor property
        >
          {tutor.subject}
        </h3>
        <p className="mt-2 text-center text-[12px] md:text-left">
          {tutor.desc}
        </p>

        <button
          className="mt-10 mx-auto self-end text-black font-[600] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.02)]
          w-[98px] h-[28px] text-[11px] rounded-[8px]  lg:mr-14"
          style={{ backgroundColor: tutor.buttonColor }} // Use the buttonColor property
        >
          View Profile
        </button>
      </div>
    </div>
  );
};


const DesktopTutorCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardOrder, setCardOrder] = useState(tutors);
  const scrollRef = useRef(null);
  const visibleCardsCount = 3;
  const middleCardIndex = Math.floor(visibleCardsCount / 2);

  const cycleCards = () => {
    setCardOrder((prevOrder) => {
      const newOrder = [...prevOrder.slice(1), prevOrder[0]];
      return newOrder;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      cycleCards();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:block pt-4">
      <h1 className=" text-center font-[600] text-[27px]  ">Featured Tutors</h1>
      <div className="relative w-full flex justify-center items-center">
        <div
          ref={scrollRef}
          className="w-full max-w-[1536px] h-[320px] items-center py-2 flex overflow-hidden scroll-smooth"
        >
          <div className="flex justify-center items-center gap-6  transition-all">
            {cardOrder.map((tutor, index) => (
              <div
                key={tutor.id}
                className={`shrink-0 transition-all duration-[1.5s] ease-in-out mx-6 ${
                  index === middleCardIndex ? "scale-105" : "scale-100"
                }`}
                style={{
                  width: "500px",
                  minWidth: "300px",
                }}
              >
                <TutorCard tutor={tutor} scale={index === middleCardIndex} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileTutorCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to show the next card
  const nextCard = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === tutors.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Change the card every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextCard();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="block md:hidden pt-4 ">
      <h1 className="text-center font-[600] text-[24px]">Featured Tutors</h1>
      <div className="relative w-full mt-10 flex justify-center items-center">
        {/* Show only the current tutor card */}
        <div className="w-full max-w-[1536px] h-[400px] flex justify-center items-center overflow-hidden">
          <TutorCard tutor={tutors[currentIndex]} />
        </div>
      </div>
    </div>
  );
};



const TutorCarousel = () => {
  return (
    <div className={poppins.className}>
      <DesktopTutorCarousel />
      <MobileTutorCarousel />
    </div>
  );
};

export default TutorCarousel;
