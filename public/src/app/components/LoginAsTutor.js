"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Use useSearchParams
import toast from "react-hot-toast";

export default function LoginAsTutor() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params here

  const handleFormDataChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleLoginWithPassword = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please provide all the credentials");
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading("Logging in...");

    try {
      const res = await signIn("tutor_credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: `${window.location.origin}/tutor/tutor-dashboard`,
      });

      if (res?.error) {
        // Display error toast if login fails
        toast.error("Login failed. Please try again.", { id: loadingToastId });

        // Reset form data if needed
        setFormData({
          email: "",
          password: "",
        });
      } else if (res.ok && res.url) {
        // Update toast to success and redirect on success
        toast.success("Login successful!", { id: loadingToastId });
        router.push("/tutor/tutor-dashboard"); // Redirect to tutor dashboard
      }
    } catch (error) {
      // General error handling
      toast.error("An error occurred during login.", { id: loadingToastId });
      console.error("Login error:", error);
    }
  };

  const handleLoginWithGoogle = async () => {
    // Show loading toast
    const loadingToastId = toast.loading("Logging in...");

    try {
      // Start the sign-in process
      const res = await signIn("google_tutor", {
        callbackUrl: `${window.location.origin}/tutor/tutor-dashboard`,
      });
    } catch (error) {
      toast.error("An unexpected error occurred during login.");
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl"); // Get the 'callbackUrl' parameter from the URL

    if (callbackUrl) {
      // Assuming that if callbackUrl exists, it means the login was unsuccessful
      toast.error("Login unsuccessful. Please try again.");
    }
  }, [searchParams]);

  const handleLoginWithForgotPassword = () => {
    router.push("/tutor-forgot-password");
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleLoginWithPassword}>
      <div>
        <label className="text-[12px] md:text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email id"
          className="w-full px-3 py-2 border text-[10px] sm:text-xs outline-primary-400 rounded-md font-normal"
          id="email"
          value={formData.email}
          onChange={handleFormDataChange}
        />
      </div>
      <div>
        <label
          className="text-[12px] md:text-sm font-semibold"
          htmlFor="password"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleFormDataChange}
          placeholder="Enter the password"
          className="w-full px-3 py-2 border outline-primary-400 text-[10px] sm:text-xs rounded-md font-normal"
        />
      </div>
      <button
        type="submit"
        className="w-full mt-5 py-1 sm:text-[13px] text-[11px] font-[600] outline-secondary-600 md:text-[15px] leading-normal px-4 bg-[#E77B3E] text-white rounded-md"
      >
        Login
      </button>
      <div className="flex justify-between items-center w-full">
        <p
          onClick={handleLoginWithForgotPassword}
          className="text-[#E77B3E] hover:underline text-sm cursor-pointer font-semibold ml-auto"
        >
          Forgot Password ?
        </p>
      </div>

      {/* Other login options */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="w-full gap-2 py-[1px] px-4 border rounded-lg outline-primary-400 flex items-center justify-center text-[11px] sm:text-sm font-semibold"
          onClick={handleLoginWithGoogle}
        >
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
          Login with Google
        </button>
      </div>
      {/* <div className="mt-4">
        <button
          type="button"
          className="w-full gap-2 py-[1px] px-4 border rounded-lg flex outline-primary-400 items-center justify-center text-[11px] sm:text-sm font-semibold"
        >
          Login with Apple
        </button>
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="w-full gap-2 py-[1px] px-4 border rounded-lg flex outline-primary-400 items-center justify-center text-[11px] sm:text-sm font-semibold"
          onClick={() =>
            signIn("facebook", {
              callbackUrl: `${window.location.origin}/tutor/tutor-dashboard`,
            })
          }
        >
          Login with Facebook
        </button>
      </div> */}
    </form>
  );
}
