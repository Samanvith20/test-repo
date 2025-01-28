"use client"
import React, { useState } from 'react';

const TutorForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      const response = await fetch('/api/tutors/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password reset link has been sent to your email.');
        setError('');
        setEmail(''); // clear input field
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">Tutor Forgot Password</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow-md">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#E77B3E] text-white font-semibold py-2 rounded-lg hover:bg-[#d86a2c] transition duration-300"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default TutorForgotPasswordPage;
