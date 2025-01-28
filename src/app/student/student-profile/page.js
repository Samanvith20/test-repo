"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

 export default function Page() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    // email: "",
    phoneNumber: "",
    country: "",
    state: "",
    address: "",
  });

  const [editable, setEditable] = useState(null);

  const handlechange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("/api/student/studentProfile", {
        method: "GET",
      });
      const data = await response.json();
      console.log("data: ", data.student);
      
      // Provide default values if any fields are missing
      setFormData({
        firstName: data.student?.studentDetails?.firstName || "",
        lastName: data.student?.studentDetails?.lastName || "",
        email: data.student?.email || "",
        phoneNumber: data.student?.studentDetails?.phoneNumber || "",
        country: data.student?.studentDetails?.country || "",
        state: data.student?.studentDetails?.state || "",
        address: data.student?.studentDetails?.address || "",
      });

    } catch (error) {
      console.log("Error While fetching studentProfileDetails", error);
    }
  };

  // POST request
  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastLoading=toast.loading("Saving...");
    try {
      const response = await fetch("/api/student/studentProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      console.log("Response from server:", result);
       console.log("success",response.ok);
      if (response.ok) {
        toast.dismiss(toastLoading);
        toast.success("Profile updated successfully", );
        setEditable(null)
        fetchUserDetails();
      }else{
        toast.dismiss(toastLoading);
        toast.error("Error while updating profile");
      }
    } catch (error) {
      toast.dismiss(toastLoading);
      console.error("Error while submitting form data:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // callback function
  const makeFieldEditable = (fieldName) => {
    setEditable((prevField) => (prevField === fieldName ? null : fieldName));
  };

  return (
    <div className="flex flex-col  justify-center    bg-[blue h-full ">
     <Toaster/>
      <div className=" bg-[yellow border  h-full flex flex-col border-1 border-solid border-gray-200 justify-center   bg-whit rounded-md p-5">
        <form className="space-y-6 py-2  " onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="">
              <label
                htmlFor="firstName"
                className=" text-[15px] font-semibold "
              >
                First Name
              </label>
              <div className="relative w-full ">
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handlechange}
                  readOnly={editable !== "firstName"}
                  placeholder="Enter your first name"
                  className={`mt-1 text-[12px]  ${
                    editable === "firstName" ? "outline-1" : "outline-none"
                  } 
                    
                 font-normal w-full border rounded-md py-2 px-3 pr-10 `}
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  onClick={() => makeFieldEditable("firstName")}
                  className={`cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    editable === "firstName" ? "hidden" : ""
                  }`}
                >
                  <path
                    d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                    fill="#888888"
                  />
                </svg>
              </div>
            </div>
            <div className="">
              <label htmlFor="lastName" className=" text-[15px] font-semibold ">
                Last Name
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  readOnly={editable !== "lastName"}
                  onChange={handlechange}
                  placeholder="Enter your last name"
                  className={`mt-1 text-[12px] font-normal w-full border rounded-md py-2 px-3 pr-10 ${
                    editable === "lastName" ? "outline-1" : "outline-none"
                  }  `}
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  onClick={() => makeFieldEditable("lastName")}
                  className={`cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    editable === "lastName" ? "hidden" : ""
                  }`}
                >
                  <path
                    d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                    fill="#888888"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emailAdress"
                className=" text-[15px] font-semibold "
              >
                Email Address
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="email"
                  value={formData.email}
                  //  readOnly={editable !== "email"}
                  //  onChange={handlechange}
                  readOnly
                  placeholder="Enter your email address"
                  className={`mt-1 text-[12px] font-normal w-full border rounded-md py-2 px-3 pr-10 
                    
                    `}
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  // onClick={() => makeFieldEditable("email")}
                  className={`cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 
                  }`}
                >
                  <path
                    d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                    fill="#888888"
                  />
                </svg>
              </div>
            </div>
            <div>
              <label
                htmlFor="mobileNumber"
                className=" text-[15px] font-semibold "
              >
                Mobile Number
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  readOnly={editable !== "phoneNumber"}
                  onChange={handlechange}
                  placeholder="Enter your mobile number"
                  className={`mt-1 text-[12px] font-normal w-full border rounded-md py-2 px-3 pr-10 ${
                    editable === "phoneNumber" ? "outline-1" : "outline-none"
                  }  `}
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  onClick={() => makeFieldEditable("phoneNumber")}
                  className={`cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    editable === "phoneNumber" ? "hidden" : ""
                  }`}
                >
                  <path
                    d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                    fill="#888888"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className=" text-[15px] font-semibold ">
                Country
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  readOnly={editable !== "country"}
                  onChange={handlechange}
                  placeholder="Select"
                  className={`mt-1 text-[12px] font-normal w-full border rounded-md py-2 px-3 pr-10 ${
                    editable === "country" ? "outline-1" : "outline-none"
                  }  `}
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  onClick={() => makeFieldEditable("country")}
                  className={`cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    editable === "country" ? "hidden" : ""
                  }`}
                >
                  <path
                    d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                    fill="#888888"
                  />
                </svg>
              </div>
            </div>
            <div>
              <label htmlFor="state" className=" text-[15px] font-semibold ">
                State
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="state"
                  value={formData.state}
                  readOnly={editable !== "state"}
                  onChange={handlechange}
                  placeholder="Select"
                  className={`mt-1 text-[12px] font-normal w-full border rounded-md py-2 px-3 pr-10 ${
                    editable === "state" ? "outline-1" : "outline-none"
                  }  `}
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  onClick={() => makeFieldEditable("state")}
                  className={`cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    editable === "state" ? "hidden" : ""
                  }`}
                >
                  <path
                    d="M2.99609 12.9051V14.6249C2.99609 14.7243 3.0356 14.8197 3.10593 14.8901C3.17625 14.9604 3.27164 14.9999 3.37109 14.9999H5.09459C5.19386 14.9999 5.28906 14.9605 5.35934 14.8904L12.4453 7.80439L10.1953 5.55439L3.10634 12.6404C3.03597 12.7105 2.99631 12.8058 2.99609 12.9051ZM11.1238 4.62514L13.3738 6.87514L14.4688 5.78014C14.6094 5.63949 14.6884 5.44876 14.6884 5.24989C14.6884 5.05101 14.6094 4.86028 14.4688 4.71964L13.2801 3.53014C13.1394 3.38953 12.9487 3.31055 12.7498 3.31055C12.551 3.31055 12.3602 3.38953 12.2196 3.53014L11.1238 4.62514Z"
                    fill="#888888"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="">
            <label htmlFor="address" className=" text-[15px] font-semibold ">
              Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={handlechange}
              rows={3}
              placeholder="Enter your address"
              className="mt-1 block w-full border  rounded-md shadow-sm py-2 px-3 "
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full  mt-2 py-2 px-4 bg-[#E77B3E] text-white font-normal rounded-md "
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


