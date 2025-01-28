import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ClientLayout from "./ClientLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "EduEliteConnect",
  description:
    "Unlock your full potential with EduEliteConnect! Connect with expert tutors anytime, anywhere, and get instant solutions to your toughest academic challenges. Your personal guide to success is just a click away!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-auto custom-scrollbar`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
