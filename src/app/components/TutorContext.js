"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TutorContext = createContext();

export const TutorProvider = ({ children }) => {
  const [tutorInitialDetails, setTutorInitialDetails] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    zipCode: "",
  });

  const [tutorInformation, setTutorInformation] = useState({
    gender: "",
    dob: "",
    age: "",
    experience: "",
    hourlyPrice: "",
    socialSecurityNumber: "",
    level: "",
    responseTime: "",
    cancellationDuration: "",
    availability: [],
    timezone: "",
    profileInfo: {
      headline: "",
      about: "",
      profilePicture: null,
    },
    education: [
      {
        highestEducation: "",
        university: "",
        typeOfDegree: "",
        degreeFile: null,
        major: "",
        certificatesFile: null,
      },
    ],
  });

  console.log("TUTOR INFORMATION: ", tutorInformation);
  

  const [stepsCleared, setStepsCleared] = useState({
    step0: true,
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  const [subjectsTaught, setSubjectsTaught] = useState([]);
  const [isRulesAccepted, setIsRulesAccepted] = useState(false);
  console.log("SUBJECTS TAUGHT: ", subjectsTaught);
  
  const [termsAndConditionsCheckboxes, setTermsAndConditionsCheckboxes] =
    useState({
      agreeTerms: false,
      readTerms: false,
      ssnAuthorization: false,
    });

  const [callApi, setCallApi] = useState(false);

  // Use Effect for the API call
  useEffect(() => {
    const handleTutorRegistration = async () => {
      const formData = new FormData();
      console.log("API FOR TUTOR REGISTRATION CALLED");

      // Append basic details
      formData.append("email", tutorInitialDetails.email);
      formData.append("password", tutorInitialDetails.password);
      formData.append("firstName", tutorInitialDetails.firstName);
      
      formData.append("lastName", tutorInitialDetails.lastName);
     
      formData.append("zipCode", tutorInitialDetails.zipCode);
      formData.append("gender", tutorInformation.gender);
      formData.append("dob", tutorInformation.dob);
      formData.append("age", tutorInformation.age);
      formData.append("socialSecurityNumber", tutorInformation.socialSecurityNumber);
      formData.append("experience", tutorInformation.experience);
      formData.append("level", tutorInformation.level);
      formData.append("hourlyPrice", tutorInformation.hourlyPrice);
      formData.append(
        "cancellationDuration",
        tutorInformation.cancellationDuration
      );
      formData.append("responseTime", tutorInformation.responseTime);
      formData.append(
        "availability",
        JSON.stringify(tutorInformation.availability)
      );
      formData.append('subjectsTaught', JSON.stringify(subjectsTaught))
      formData.append("timezone", JSON.stringify(tutorInformation.timezone));
      formData.append("headline", tutorInformation.profileInfo.headline);
      formData.append("about", tutorInformation.profileInfo.about);

      // Append files (profilePicture, uploadDegree, uploadCertificate)
      if (tutorInformation.profileInfo.profilePicture) {
        formData.append(
          "profilePicture",
          tutorInformation.profileInfo.profilePicture
        );
      }

      tutorInformation.education.forEach((edu, index) => {
        formData.append(
          `education[${index}][highestEducation]`,
          edu.highestEducation
        );
        formData.append(`education[${index}][university]`, edu.university);
        formData.append(`education[${index}][typeOfDegree]`, edu.typeOfDegree);
        formData.append(`education[${index}][major]`, edu.major);
        if (edu.degreeFile) {
          formData.append(`education[${index}][degreeFile]`, edu.degreeFile);
        }
        if (edu.certificatesFile) {
          formData.append(
            `education[${index}][certificatesFile]`,
            edu.certificatesFile
          );
        }
      });

      // subjectsTaught.forEach((subject, subjectIndex) => {
      //   formData.append(
      //     `subjectsTaught[${subjectIndex}][subjectExpertise]`,
      //     subject.subjectExpertise
      //   );

      //   // Ensure areaOfSubject is an array before iterating
      //   if (Array.isArray(subject.areaOfSubjects)) {
      //     subject.areaOfSubjects.forEach((area, areaIndex) => {
      //       formData.append(
      //         `subjectsTaught[${subjectIndex}][areaOfSubjects][${areaIndex}]`,
      //         area
      //       );
      //     });
      //   }
      // });



      // Append terms and conditions
      formData.append("agreeTerms", termsAndConditionsCheckboxes.agreeTerms);
      formData.append("readTerms", termsAndConditionsCheckboxes.readTerms);
      formData.append(
        "ssnAuthorization",
        termsAndConditionsCheckboxes.ssnAuthorization
      );

      console.log('FormData: ', formData)
      try {
        // POST request using FormData
        const response = await fetch("/api/tutors/register", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to register tutor");
        }

        const result = await response.json();
        console.log("Tutor registration successful:", result);
        // Handle success
      } catch (error) {
        console.error("Error registering tutor:", error);
        // Handle error
      }
    };

    if (callApi) {
      handleTutorRegistration();
      setCallApi(false); // Reset the callApi state after the API call
    }
  }, [
    callApi,
    tutorInitialDetails,
    tutorInformation,
    subjectsTaught,
    isRulesAccepted,
    termsAndConditionsCheckboxes,
  ]);

  return (
    <TutorContext.Provider
      value={{
        tutorInitialDetails,
        setTutorInitialDetails,
        setStepsCleared,
        stepsCleared,
        subjectsTaught,
        setSubjectsTaught,
        isRulesAccepted,
        setIsRulesAccepted,
        tutorInformation,
        setTutorInformation,
        termsAndConditionsCheckboxes,
        setTermsAndConditionsCheckboxes,
        setCallApi,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
};

export const useTutor = () => {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error("useTutor must be used within a TutorProvider");
  }
  return context;
};
