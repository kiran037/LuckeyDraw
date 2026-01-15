// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { user_role } from "./generated/client/enums";

/* ===================== TYPES ===================== */

interface AppJwtPayload {
  userId: string;
  role: user_role;
}

/* ===================== PROXY ===================== */

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  /* ---------- AUTH PAGES ---------- */
  // If user is on signin and already logged in, redirect based on role
  if (pathname === "/signin") {
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as AppJwtPayload;

        // Redirect based on role
        if (decoded.role === user_role.ADMIN) {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url)
          );
        } else {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        // Invalid token → allow access to auth pages
      }
    }
    return NextResponse.next();
  }

  /* ---------- ADMIN AREA ---------- */
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/signin?mode=login&redirect=" + pathname, request.url)
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as AppJwtPayload;

      // Only ADMIN can access admin routes
      if (decoded.role !== user_role.ADMIN) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL("/signin?mode=login", request.url)
      );

      response.cookies.delete({
        name: "token",
        path: "/",
      });

      return response;
    }
  }

  /* ---------- USER AREA ---------- */
  // User routes require authentication (both USER and ADMIN can access)
  if (pathname.startsWith("/user")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/signin?mode=login&redirect=" + pathname, request.url)
      );
    }

    try {
      // Verify token is valid (both USER and ADMIN roles can access)
      jwt.verify(token, process.env.JWT_SECRET as string);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL("/signin?mode=login", request.url)
      );

      response.cookies.delete({
        name: "token",
        path: "/",
      });

      return response;
    }
  }

  /* ---------- API ADMIN ROUTES ---------- */
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as AppJwtPayload;

      // Only ADMIN can access admin API routes
      if (decoded.role !== user_role.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

/* ===================== CONFIG ===================== */

export const config = {
  matcher: [
    "/signin",
    "/admin/:path*",
    "/user/:path*",
    "/api/admin/:path*",
  ],
};