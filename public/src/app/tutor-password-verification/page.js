"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

const TutorPasswordResetForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`/api/tutors/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
      } else {
        setStatus("Password updated successfully!");
        setError(null);
        setTimeout(() => {
          router.push("/login"); // Redirect to login after success
        }, 2000);
      }
    } catch (error) {
      setError("An error occurred while resetting the password.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${poppins.className}`}>
      <div className="w-full max-w-md bg-white rounded-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-6">Reset Tutor Password</h1>
        {status && <p className="text-green-500 mb-4">{status}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-left text-gray-700 mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full px-3 py-2 border rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-left text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-3 py-2 border rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E77B3E] text-white py-2 rounded-lg hover:bg-[#d86a2c]"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

const SuspenseWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TutorPasswordResetForm />
    </Suspense>
  );
};

export default SuspenseWrapper;
