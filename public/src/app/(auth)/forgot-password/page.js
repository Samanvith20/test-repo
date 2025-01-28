"use client"

import { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
//   const[password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Send the email to the server
    const response = await fetch('/api/student/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, }),
    });
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center h-[85vh] ">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        {submitted ? (
          <p className="text-green-600 text-center">
            If the email is valid, a reset link will be sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Enter your email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
