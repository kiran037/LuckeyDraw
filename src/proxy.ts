// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // npm install jose

/* ===================== CONFIG ===================== */
// Define roles locally to avoid importing Prisma Client (which crashes Edge Runtime)
const USER_ROLE = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Use TextEncoder for jose
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  /* ---------- AUTH PAGES ---------- */
  if (pathname === "/signin") {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);

        if (payload.role === USER_ROLE.ADMIN) {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (e) {
        // Invalid token, allow access to signin
      }
    }
    return NextResponse.next();
  }

  /* ---------- ADMIN AREA ---------- */
  if (pathname.startsWith("/admin")) {
    if (!token) return redirectToLogin(request);

    try {
      const { payload } = await jwtVerify(token, secret);

      if (payload.role !== USER_ROLE.ADMIN) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    } catch (e) {
      return logoutAndRedirect(request);
    }
  }

  /* ---------- USER AREA ---------- */
  if (pathname.startsWith("/user")) {
    if (!token) return redirectToLogin(request);

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (e) {
      return logoutAndRedirect(request);
    }
  }

  /* ---------- API ADMIN ROUTES ---------- */
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secret);

      if (payload.role !== USER_ROLE.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
      return NextResponse.next();
    } catch (e) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Helper: Redirect to Login
function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/signin?mode=login&redirect=" + request.nextUrl.pathname, request.url)
  );
}

// Helper: Clear cookie and redirect
function logoutAndRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/signin?mode=login", request.url));
  response.cookies.delete("token");
  return response;
}

export const config = {
  matcher: [
    "/signin",
    "/admin/:path*",
    "/user/:path*",
    "/api/admin/:path*",
  ],
};