"use client";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Jan", earnings: 300 },
  { name: "Feb", earnings: 600 },
  { name: "Mar", earnings: 0 },
  { name: "Apr", earnings: 100 },
  { name: "May", earnings: 50 },
  { name: "June", earnings: 20 },
  { name: "July", earnings: 200 },
  { name: "Aug", earnings: 700 },
  { name: "Sept", earnings: 400 },
  { name: "Oct", earnings: 500 },
  { name: "Nov", earnings: 300 },
  { name: "Dec", earnings: 200 },
];

const EarningsLineChart = () => {
  const [isClient, setIsClient] = useState(false);

  // Only render the chart on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server side
  }

  return (
    <div className="w-full bg-white py-4 rounded-lg ">
      {/* <h3 className="text-black">Earning Statistics</h3> Title for the chart */}
      <div className="w-full  h-[320px]">  {/* Set the height */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#000", fontSize: 10}}  // Ensure font color is black and size is readable
              axisLine={{ stroke: '#000' }}           // Set axis line color
              tickLine={{ stroke: '#000' }}           // Set tick line color
              tickMargin={10}
            />
            <YAxis
              axisLine={{ stroke: '#000' }}           // Set axis line color
              tickLine={{ stroke: '#000' }}           // Set tick line color
              tick={{ fill: "#000", fontSize: 12 }}   // Ensure font color is black and size is readable
              tickMargin={10}
              domain={[0, 'dataMax + 100']}           // Adjust domain to avoid clipping
              allowDataOverflow={true}                  // Ensure ticks stay within bounds
              ticks={[0, 100, 200, 300, 400, 500, 600, 700]} // Specify tick values for better control
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Earnings"]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#1fc8db"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#1fc8db", strokeWidth: 2 }}
              activeDot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsLineChart;
