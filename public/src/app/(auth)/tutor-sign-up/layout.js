import { TutorProvider } from "@/app/components/TutorContext";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function TutorSignUpLayout({ children }) {
  return (
    <div className={`min-h-fit mb-10 ${poppins.className}`}>
      <div className="container  mx-auto px-[20px] lg:px-[50px] xl:px-[86px]">
        <div className=" py-4  flex justify-center ">
          {/* <h1 className="font-[600] text-[23px] sm:text-[25px]  md:text-[27px] leading-normal">
            Tutor Sign Up
          </h1> */}
        </div>

        <TutorProvider>
          <div className="w-full">{children}</div>
        </TutorProvider>
      </div>
    </div>
  );
}
