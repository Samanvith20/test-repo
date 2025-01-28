"use client";

import React, { useEffect, useState } from "react";

const TransactionTable = () => {
  const [fromDate, setFromDate] = useState(() => {
    // Set default fromDate to today in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const [toDate, setToDate] = useState(() => {
    // Set default toDate to today in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("data: ", data);

  const Spinner = () => (
    <div className="flex justify-center items-center h-24">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary-600"></div>
    </div>
  );

  const fetchPaymentDetails = async (fromDate, toDate) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/student/transcation?fromDate=${fromDate}&toDate=${toDate}`,
        {
          method: "GET",
        }
      );
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setData([]);
      } else {
        setData(result);
      }
    } catch (error) {
      setError("Error fetching payment details. Please try again.");
      console.error("Error fetching payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (fromDate && toDate) {
      fetchPaymentDetails(fromDate, toDate);
    } else {
      setError("Please select both From and To dates.");
    }
  };

  useEffect(() => {
    // Fetch initial data with today's date as the range
    fetchPaymentDetails(fromDate, toDate);
  }, []);

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="border h-full rounded-md p-5">
        {/* Date Filter Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="font-medium text-[16px] text-[#000]">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-3 py-2 text-[14px] font-medium rounded-md"
            />
          </div>
          <div className="flex items-center ml-9 gap-2">
            <label className="font-medium">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-3 py-2 text-[14px] font-medium rounded-md"
            />
          </div>
          <button
            className="rounded-md ml-9 px-4 py-[2px] text-white bg-[#E77B3E]"
            onClick={handleFilter}
          >
            Filter
          </button>
        </div>

        {/* Spinner */}
        {loading && <Spinner />}

        {/* Error Message */}
        {!loading && error && (
          <div className="text-center text-red-500 font-medium my-4">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        {!loading && !error && data?.paymentDetails?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#C6E8E9] text-center">
                  <th className="px-4 py-2 border text-[16px] font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-2 border text-[16px] font-semibold">
                    Payment Intent ID
                  </th>
                  <th className="px-4 py-2 border text-[16px] font-semibold">
                    Transactions
                  </th>
                  <th className="px-4 py-2 border text-[16px] font-semibold">
                    Captured Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.paymentDetails.map((payment, index) => (
                  <React.Fragment key={index}>
                    {payment.transactionDetails?.transactions.map(
                      (message, i) => (
                        <tr key={i} className="text-center">
                          {/* Date */}
                          <td className="px-4 py-2 text-[14px] font-medium">
                            {i === 0
                              ? new Date(
                                  payment.transactionDetails.date
                                ).toLocaleDateString("en-GB")
                              : ""}
                          </td>

                          {/* Payment Intent ID */}
                          <td className="px-4 py-2 text-[14px] font-medium">
                            {i === 0
                              ? payment.transactionDetails.paymentIntentId
                              : ""}
                          </td>

                          {/* Transactions */}
                          <td className="px-4 py-2 text-[14px] font-medium">
                            {message}
                          </td>

                          {/* Captured Amount */}
                          <td className="px-4 py-2 text-[14px] font-medium">
                            {i === 0
                              ? `$${payment.transactionDetails.capturedAmount.toFixed(
                                  2
                                )}`
                              : ""}
                          </td>
                        </tr>
                      )
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Data Found */}
        {!loading && !error && data?.paymentDetails?.length === 0 && (
          <div className="text-center text-gray-500 font-medium my-4">
            No transactions found for the selected date range.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
