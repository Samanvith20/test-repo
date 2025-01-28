import React, { useState, useEffect, useRef } from "react";
import "./CustomDatePicker.css"; // Import your custom CSS file
import { FaCalendar } from "react-icons/fa6";

const CustomDatePicker = ({ selectedDate, setSelectedDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight
  // Calendar states
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState("day"); // "day", "month", or "year"
  const calendarRef = useRef(null);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  // Toggle calendar visibility
  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        isCalendarVisible
      ) {
        setIsCalendarVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarVisible]);

  // Handle date click
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    // if (clickedDate > today) return;
    clickedDate.setHours(0, 0, 0, 0); // Reset time to midnight
    if (clickedDate < today) return;

    const formattedDate = `${clickedDate.getFullYear()}-${String(
      clickedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(clickedDate.getDate()).padStart(2, "0")}`;
    setSelectedDate(formattedDate);
    setIsCalendarVisible(false);
  };

  // Handle month click
  const handleMonthClick = (month) => {
    setCurrentMonth(month);
    setViewMode("day"); // Return to day view after selecting the month
  };

  // Handle year click
  const handleYearClick = (year) => {
    setCurrentYear(year);
    setViewMode("month"); // Switch to month view after selecting the year
  };

  // Handle previous month/year navigation
  const handlePrev = () => {
    if (viewMode === "day") {
      const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
      prevMonthDate.setHours(0, 0, 0, 0);
      if (prevMonthDate < new Date(today.getFullYear(), today.getMonth(), 1))
        return;
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === "month") {
      if (currentYear - 1 < today.getFullYear()) return;
      setCurrentYear(currentYear - 1);
    } else if (viewMode === "year") {
      if (currentYear - 20 + 19 < today.getFullYear()) return;
      setCurrentYear(currentYear - 20);
    }
  };

  // Handle next month/year navigation
  const handleNext = () => {
    if (viewMode === "day") {
      // const futureDate = new Date(currentYear, currentMonth + 1, 1);
      // if (futureDate > today) return;

      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === "month") {
      setCurrentYear(currentYear + 1);
    } else if (viewMode === "year") {
      setCurrentYear(currentYear + 20);
    }
  };

  // Handle view mode change (when clicking month/year in header)
  const handleHeaderClick = () => {
    if (viewMode === "day") {
      setViewMode("month");
    } else if (viewMode === "month") {
      setViewMode("year");
    }
  };

  // Render the correct grid based on the view mode
  const renderGrid = () => {
    if (viewMode === "day") {
      // Day grid
      return (
        <>
          <div className="calendar-grid">
            <div className="calendar-day">Sun</div>
            <div className="calendar-day">Mon</div>
            <div className="calendar-day">Tue</div>
            <div className="calendar-day">Wed</div>
            <div className="calendar-day">Thu</div>
            <div className="calendar-day">Fri</div>
            <div className="calendar-day">Sat</div>

            {[...Array(startDay)].map((_, index) => (
              <div key={index} className="calendar-empty"></div>
            ))}

            {[...Array(daysInMonth)].map((_, day) => {
              const currentDay = day + 1;
              const currentDate = new Date(
                currentYear,
                currentMonth,
                currentDay
              );
              currentDate.setHours(0, 0, 0, 0); // Reset time to midnight
              // const isFutureDate = currentDate > today;
              const isPastDate = currentDate < today;
              const isSelected =
                selectedDate ===
                `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
                  2,
                  "0"
                )}`;

              return (
                <div
                  key={day}
                  className={`calendar-day-number ${
                    isSelected ? "selected" : ""
                  } ${isPastDate ? "disabled" : ""}`}
                  onClick={() => !isPastDate && handleDateClick(currentDay)}
                >
                  {currentDay}
                </div>
              );
            })}
          </div>
        </>
      );
    } else if (viewMode === "month") {
      // Month grid
      const months = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString("default", { month: "long" })
      );

      return (
        <div className="calendar-grid months">
          {months.map((month, index) => {
            const isPastMonth =
              currentYear === today.getFullYear() && index < today.getMonth();

            return (
              <div
                key={index}
                //       className="calendar-month cursor-pointer"
                //  onClick={() => handleMonthClick(index)}
                className={`calendar-month cursor-pointer ${
                  isPastMonth ? "disabled" : ""
                }`}
                onClick={() => !isPastMonth && handleMonthClick(index)}
              >
                {month}
              </div>
            );
          })}
        </div>
      );
    } else if (viewMode === "year") {
      // Year grid (20 years range)
      const startYear = Math.floor(currentYear / 20) * 20;
      const years = Array.from({ length: 20 }, (_, i) => startYear + i);

      return (
        <div className="calendar-grid years">
          {years.map((year) => {
            const isPastYear = year < today.getFullYear();

            return (
              <div
                key={year}
                F
                className={`calendar-year cursor-pointer ${
                  isPastYear ? "disabled" : ""
                }`}
                onClick={() => !isPastYear && handleYearClick(year)}
              >
                {year}
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="custom-date-picker  w-[40px] flex items-center justify-center my-auto h-full ">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="date-input"
        style={{ display: "none" }}
      />
      <button onClick={toggleCalendar} className="ml-auto mr-0 md:mr-10">
        <FaCalendar />
      </button>

      {isCalendarVisible && (
        <div
          ref={calendarRef}
          className="calendar-container shadow-lg rounded-b-[16px] overflow-hidden "
        >
          <div className="calendar-header">
            <button
              onClick={handlePrev}
              className="mr-2 font-[600]"
              aria-label="Previous"
            >
              &lt;
            </button>
            <h3
              onClick={handleHeaderClick}
              className="cursor-pointer w-[140px] text-center"
            >
              {viewMode === "day"
                ? `${new Date(currentYear, currentMonth).toLocaleString(
                    "default",
                    { month: "long" }
                  )} ${currentYear}`
                : viewMode === "month"
                ? `${currentYear}`
                : `${Math.floor(currentYear / 20) * 20} - ${
                    Math.floor(currentYear / 20) * 20 + 19
                  }`}
            </h3>
            <button
              onClick={handleNext}
              className="ml-2 font-[600]"
              aria-label="Next"
            >
              &gt;
            </button>
          </div>

          {/* Render the appropriate grid based on the view mode */}
          {renderGrid()}
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
