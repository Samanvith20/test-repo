"use client";
import Image from "next/image";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { toast, Toaster } from "react-hot-toast"; // Import toast
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

export default function SignupForm() {
  // State variables to track form inputs
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const router = useRouter();

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from submitting and reloading the page

    if (formData.password === "") {
      toast.error("Please Enter the Password");
    }

    // Display toast promise when making the API call
    const signUpPromise = toast.promise(
      fetch("/api/student/student-sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the form data to the backend
      })
        .then((response) => {
          if (!response.ok) {
            // If the response status is not 200-299, throw the error with the specific message from backend
            return response.json().then((data) => {
              throw new Error(data.message || "Failed to sign up"); // Use the backend message or default message
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.message); // Throw an error with backend message if any error exists
          }
          return data;
        }),
      {
        loading: "Signing up...",
        success: "Signed up successfully!",
        // Display the backend error message dynamically
        error: (error) => error.message || "Sign up failed! Please try again.",
      }
    );

    try {
      const data = await signUpPromise;
      console.log("User registered successfully", data);

      // Reset form after successful signup
      setFormData({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
      });

      // Redirect user to login page after successful signup
      router.push("/login");
    } catch (error) {
      console.error("Error while registering the user", error);
    }
  };

  return (
    <div className={`flex justify-center items-center ${poppins.className}`}>
      <Toaster />
      {/* left hand side (image) */}
      <div className="hidden  lg:block relative  md:min-w-[700px] md:min-h-[460px] mt-16 ">
        <Image
          src={"/images/login_page_big-image.png"}
          width={344}
          height={328}
          alt="login page big image"
          quality={100}
          unoptimized
          className="absolute top-0 left-16 z-2"
        />
        <div className="absolute bottom-12 right-[160px] z-19 p-1 bg-white flex items-center justify-center rounded-full">
          <Image
            src={"/images/login-page_small-image.png"}
            width={224}
            height={170}
            alt="login page small image"
            quality={100}
            unoptimized
          />
        </div>
        <div className="absolute bottom-[32px] right-[190px] bg-[#E77B3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="195"
            height="60"
            viewBox="0 0 195 60"
            fill="none"
          >
            <path
              d="M194.528 19.1079L182.371 17.6234L180.887 29.7805L193.044 31.265L194.528 19.1079ZM3.55157 1.97741C3.29376 1.19012 2.44653 0.760897 1.65924 1.01871C0.871956 1.27652 0.442731 2.12375 0.700544 2.91103L3.55157 1.97741ZM186.783 23.2628C144.64 56.234 102.237 61.3753 68.6833 53.051C35.018 44.6991 10.3869 22.8507 3.55157 1.97741L0.700544 2.91103C7.94646 25.0381 33.606 47.4397 67.961 55.9627C102.427 64.5135 145.775 59.1546 188.632 25.6256L186.783 23.2628Z"
              fill="#E77B3E"
            />
          </svg>
        </div>
      </div>

      {/* right hand side (form) */}
      <div className="bg-[#E7E7E7] w-full h-fit  py-4  my-6 lg:h-[85%] lg:w-[30%] md:w-[60%] sm:w-full px-4 rounded-2xl">
        <div className="  rounded-lg shadow-md px-14 flex flex-col justify-center py-10   bg-[#FFF]  mx-auto h-[90%] ">
          <h1 className="text-[18px]  text-center my-2 font-[600]">
            Welcome to EduEliteConnect
          </h1>

          {/* Signup form */}
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your User Id"
                className="w-full  px-3 py-2 border text-xs rounded-md outline-primary-400  font-normal"
                id="username"
                value={formData.username} // Controlled input
                onChange={handleInputChange} // Track changes
              />
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="username">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter your Phone Number"
                className="w-full  px-3 py-2 border text-xs rounded-md outline-primary-400  font-normal"
                id="phoneNumber"
                value={formData.phoneNumber} // Controlled input
                onChange={handleInputChange} // Track changes
              />
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your Email Id"
                className="w-full  px-3 py-2 border text-xs rounded-md outline-primary-400  font-normal"
                id="email"
                value={formData.email} // Controlled input
                onChange={handleInputChange} // Track changes
              />
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <input
                required
                type="password"
                id="password"
                placeholder="Enter the password"
                className="w-full px-3 py-2 border outline-primary-400 text-xs rounded-md font-normal"
                value={formData.password} // Controlled input
                onChange={handleInputChange} // Track changes
              />
            </div>

            <button
              type="submit"
              className="w-full  mt-5 py-2 px-4 bg-[#E77B3E] outline-secondary-600 text-white font-normal rounded-md"
            >
              Sign up
            </button>
          </form>

          <div className="text-center my-auto font-[500] text-gray-500">or</div>

          {/* Social signups */}
          <div className="mt-0">
            <button
              type="button"
              className="w-full gap-2 py-[1px] px-4 border rounded-lg flex items-center justify-center text-sm font-semibold"
              onClick={() =>
                signIn("google", {
                  callbackUrl: `${window.location.origin}/student/student-dashboard`,
                })
              }
            >
              Sign up with Google
              {/* Google SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M16.3541 7.53113H15.75V7.5H9V10.5H13.2386C12.6203 12.2464 10.9586 13.5 9 13.5C6.51487 13.5 4.5 11.4851 4.5 9C4.5 6.51487 6.51487 4.5 9 4.5C10.1471 4.5 11.1908 4.93275 11.9854 5.63962L14.1068 3.51825C12.7673 2.26987 10.9755 1.5 9 1.5C4.85812 1.5 1.5 4.85812 1.5 9C1.5 13.1419 4.85812 16.5 9 16.5C13.1419 16.5 16.5 13.1419 16.5 9C16.5 8.49713 16.4482 8.00625 16.3541 7.53113Z"
                  fill="#FFC107"
                />
                <path
                  d="M2.36523 5.50912L4.82936 7.31625C5.49611 5.6655 7.11086 4.5 9.00048 4.5C10.1476 4.5 11.1912 4.93275 11.9859 5.63962L14.1072 3.51825C12.7677 2.26987 10.976 1.5 9.00048 1.5C6.11973 1.5 3.62148 3.12637 2.36523 5.50912Z"
                  fill="#FF3D00"
                />
                <path
                  d="M9.00012 16.5003C10.9374 16.5003 12.6976 15.7589 14.0285 14.5533L11.7072 12.589C10.9291 13.1812 9.97796 13.5013 9.00012 13.5003C7.04937 13.5003 5.39299 12.2564 4.76899 10.5205L2.32324 12.4049C3.56449 14.8338 6.08524 16.5003 9.00012 16.5003Z"
                  fill="#4CAF50"
                />
                <path
                  d="M16.3541 7.53113H15.75V7.5H9V10.5H13.2386C12.9428 11.3312 12.41 12.0574 11.706 12.5891L11.7071 12.5884L14.0284 14.5526C13.8641 14.7019 16.5 12.75 16.5 9C16.5 8.49713 16.4482 8.00625 16.3541 7.53113Z"
                  fill="#1976D2"
                />
              </svg>
            </button>
          </div>

          {/* <div className="mt-2">
            <button
              type="button"
              className="w-full gap-2 py-[1px] border  rounded-lg flex items-center justify-center text-sm font-semibold"
            >
              Sign up with Apple
              
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="18"
                viewBox="0 0 19 18"
                fill="none"
              >
                <path
                  d="M13.2874 15.21C12.5524 15.9225 11.7499 15.81 10.9774 15.4725C10.1599 15.1275 9.40988 15.1125 8.54738 15.4725C7.46738 15.9375 6.89738 15.8025 6.25238 15.21C2.59238 11.4375 3.13238 5.6925 7.28738 5.4825C8.29988 5.535 9.00488 6.0375 9.59738 6.0825C10.4824 5.9025 11.3299 5.385 12.2749 5.4525C13.4074 5.5425 14.2624 5.9925 14.8249 6.8025C12.4849 8.205 13.0399 11.2875 15.1849 12.15C14.7574 13.275 14.2024 14.3925 13.2799 15.2175L13.2874 15.21ZM9.52238 5.4375C9.40988 3.765 10.7674 2.385 12.3274 2.25C12.5449 4.185 10.5724 5.625 9.52238 5.4375Z"
                  fill="black"
                />
              </svg>
            </button>
          </div> */}

          {/* <div className="mt-2">
            <button
              type="button"
              className="w-full gap-2 py-[1px] border  rounded-lg flex items-center justify-center text-sm font-semibold"
              onClick={() =>
                signIn("facebook", {
                  callbackUrl: `${window.location.origin}/student/student-profile`,
                })
              }
            >
              Sign up with Facebook
             
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="18"
                viewBox="0 0 19 18"
                fill="none"
              >
                <path
                  d="M16.9044 0.679688H2.09797C1.59082 0.679688 1.17969 1.09082 1.17969 1.59797V16.4044C1.17969 16.9115 1.59082 17.3227 2.09797 17.3227H16.9044C17.4115 17.3227 17.8227 16.9115 17.8227 16.4044V1.59797C17.8227 1.09082 17.4115 0.679688 16.9044 0.679688Z"
                  fill="#3D5A98"
                />
                <path
                  d="M12.661 17.3212V10.8764H14.8238L15.1472 8.3648H12.661V6.76168C12.661 6.03465 12.8635 5.53824 13.9055 5.53824H15.2358V3.28824C14.5916 3.22123 13.9443 3.1893 13.2966 3.19262C11.3813 3.19262 10.0622 4.3598 10.0622 6.51277V8.3648H7.89941V10.8764H10.0622V17.3212H12.661Z"
                  fill="white"
                />
              </svg>
            </button>
          </div> */}

          <div className="mt-7 text-center text-sm  font-[500] flex flex-col gap-[6px]">
            <p className="">
              Already have an account?
              <Link href={"/login"}>
                <span className="text-[#E77B3E]  text-sm  font-semibold ml-1">
                  Login
                </span>
              </Link>
            </p>
            <Link href={"/tutor-sign-up"}>
              <p className="underline font-[500] text-secondary-600 hover:text-secondary-800 cursor-pointer">
                Want to be a Tutor?
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
