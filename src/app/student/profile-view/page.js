"use client"
import Image from "next/image";
import { Poppins } from "next/font/google";



const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });



export default function TutorProfile() {
  
  return (
    <div
      className={`flex justify-center items-center w-full h-full  p-4 ${poppins.className}`}
    >
      <div className="container mx-auto px-4 lg:px-10 xl:px-20  bg-white flex justify-center items-center">
        <div className="w-full md:max-w-[90%] bg-white flex flex-col md:flex-row gap-6 border rounded-lg overflow-hidden">
          {/* Left Column */}
          <div className="md:w-1/3 w-full  p-6 border-b-2 md:border-b-0 md:border-r-2">
            <div className="text-center">
              <div className="relative mb-4 flex items-center justify-center">
                <Image
                  src="/images/tutorprofile.png"
                  width={130}
                  height={130}
                  alt="Tutor profile image"
                  quality={100}
                  unoptimized
                  className="rounded-full"
                />
                
              </div>
              <h2 className="text-[16px] text-[#5D5D5D] font-medium mb-2">
                Shaping Success One Session at a Time
              </h2>
              <div className="flex justify-center items-center gap-2 mb-4">
                <span className="text-[15px] text-[#454545] font-semibold">
                  5
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                >
                  <path
                    d="M9.49984 13.672L12.7853 15.6591C13.3869 16.0232 14.1232 15.4849 13.9648 14.8041L13.094 11.0674L15.9994 8.5499C16.5298 8.09073 16.2448 7.2199 15.5482 7.16448L11.7244 6.8399L10.2282 3.30906C9.95901 2.66781 9.04068 2.66781 8.77151 3.30906L7.27526 6.83198L3.45151 7.15656C2.75484 7.21198 2.46984 8.08281 3.00026 8.54198L5.90568 11.0595L5.03484 14.7961C4.87651 15.477 5.61276 16.0153 6.21443 15.6511L9.49984 13.672Z"
                    fill="#DFB409"
                  />
                </svg>
                <span className="text-[#454545] text-[16px] font-medium">
                  | 2 Years Experience
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-3">
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>English</p>
                  </div>
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>Spanish</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Subject Expertise
                </h3>
                <div className="text-[#5D5D5D] inline-block  mt-3 text-[15px] font-semibold border  px-4 py-2">
                  <p>Physics</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                  Area of Expertise
                </h3>
                <div className="flex flex-wrap gap-3">
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>Dynamics</p>
                  </div>
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>Kinematics</p>
                  </div>
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>Kinematics</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-24">
                <div>
                  <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                    Gender
                  </h3>
                  <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                    <p>Male</p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 w-full p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <h1 className="text-[27px] font-semibold text-[#1A696B] mb-2 sm:mb-0">
                Rahul Verma
              </h1>
              <p className="text-[#252525] text-[16px] font-semibold">
                Hourly Rate : <span className="#1E8D8F ">$20</span>
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                About
              </h3>
              <p className="text-[15px] font-medium text-[#4F4F4F]">
                Hi, I’m Rahul Verma, a dedicated Physics tutor with a passion
                for helping students excel in their academic journey. My
                teaching approach focuses on simplifying complex concepts and
                building a strong foundation in Physics. With two years of
                tutoring experience, I’ve guided students from high school to
                intermediate levels, ensuring they gain both theoretical
                knowledge and problem-solving skills.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-2">
                Availability
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                  <p>Monday 9Am - 9Pm</p>
                </div>
                <div className="text-[#5D5D5D] text-[15px] font-semibold border px-4 py-2">
                  <p>Tuesday 12Pm - 3Pm</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[18px]  text-[#252525] mb-1">
                Education
              </h3>
              <div className="text-[#5D5D5D]  inline-block text-[15px] font-semibold border  px-4 py-2">
                <p>MSc</p>
              </div>
              <div className="text-[#5D5D5D]  ml-7  inline-block text-[15px] font-semibold border  px-4 py-2">
                <p>Physics</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#252525] mb-1">
                Certifications
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="text-[#5D5D5D] inline-block text-[15px] font-semibold border px-4 py-2">
                  <p>Mastery in Advanced Physics</p>
                </div>
                <div className="text-[#5D5D5D] inline-block text-[15px] font-semibold border px-4 py-2">
                  <p>Certified Physics Educator</p>
                </div>
                <div className="text-[#5D5D5D] inline-block text-[15px] font-semibold border px-4 py-2">
                  <p>Physics Pedagogy Certification</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end mt-4 gap-4">
              <button className="px-4 py-2 text-[16px] border-[#E77B3E] font-semibold border rounded-lg text-[#E77B3E]">
                Chat With Tutor
              </button>
              <button className="px-4 py-2 bg-[#E77B3E] text-white rounded-lg text-[16px] font-semibold">
                Request a Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}