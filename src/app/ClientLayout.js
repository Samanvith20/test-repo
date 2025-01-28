"use client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SessionProvider } from "next-auth/react";
const ClientLayout = ({ children }) => {
  return (
    <>
      <SessionProvider>
        <div className="">
          <Navbar />
        </div>
        {/* change the padding top value based on the height of the navbar */}
        <main className="pt-[58px] relative ">
          {children}
        </main>
        <footer>
          <Footer />
        </footer>
      </SessionProvider>
    </>
  );
};  

export default ClientLayout;
