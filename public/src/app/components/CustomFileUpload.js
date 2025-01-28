"use client";
import React, { useRef, useState, useEffect } from "react";

export default function CustomFileUpload({ label, onChange, existingFileName }) {
  const [fileName, setFileName] = useState(existingFileName || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (existingFileName) {
      setFileName(existingFileName);
    }
  }, [existingFileName]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFileName(file ? file.name : existingFileName);
    if (onChange) {
      onChange(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="mb-2 text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#454545]">
        {label}
      </label>
      <div className="relative overflow-hidden">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label={label}
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full text-[16px] font-normal border bg-white rounded focus:outline-none focus:ring-2 focus:ring-primary-400 px-3 py-2 flex justify-between items-center"
        >
          <span className="text-[rgba(0,0,0,0.22)] text-[12px] sm:text-[14px] font-[500] md:text-[16px]">
            {fileName || "Upload"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            className="w-5 h-5"
          >
            <path
              d="M11.4587 16.667V8.17741L8.75032 10.8857L7.29199 9.37533L12.5003 4.16699L17.7087 9.37533L16.2503 10.8857L13.542 8.17741V16.667H11.4587ZM6.25033 20.8337C5.67741 20.8337 5.18713 20.6298 4.77949 20.2222C4.37185 19.8146 4.16769 19.3239 4.16699 18.7503V15.6253H6.25033V18.7503H18.7503V15.6253H20.8337V18.7503C20.8337 19.3232 20.6298 19.8139 20.2222 20.2222C19.8146 20.6305 19.3239 20.8344 18.7503 20.8337H6.25033Z"
              fill="#5D5D5D"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
