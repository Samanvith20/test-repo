import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define the secret used for JWT verification
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  // Retrieve the JWT token from the request
  const token = await getToken({ req, secret });

  const { pathname } = req.nextUrl;

  // Define protected routes
  const tutorProtectedRoutes = ["/tutor", "/tutor-dashboard", "/tutor-profile"];
  const studentProtectedRoutes = [
    "/student",
    "/student-dashboard",
    "/student-profile",
  ];

  // Redirect logged-in users away from login and sign-up pages
  if (token && ["/login", "/sign-up", "/tutor-sign-up"].includes(pathname)) {
    // Redirect to a default page, e.g., the homepage
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If not authenticated, redirect protected routes to login
  if (!token) {
    if (
      tutorProtectedRoutes.some((path) => pathname.startsWith(path)) ||
      studentProtectedRoutes.some((path) => pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Role-based protection for tutor routes
  if (tutorProtectedRoutes.some((path) => pathname.startsWith(path))) {
    if (token.role !== "tutor") {
      // Redirect to a 403 or default page if unauthorized
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Role-based protection for student routes
  if (studentProtectedRoutes.some((path) => pathname.startsWith(path))) {
    if (token.role !== "student") {
      // Redirect to a 403 or default page if unauthorized
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow access if authenticated and authorized
  return NextResponse.next();
}

// Define paths where middleware should run
export const config = {
  matcher: [
    "/tutor/:path*",
    "/student/:path*",
    "/login",
    "/sign-up",
    
  ],
};
