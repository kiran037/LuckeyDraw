// src/lib/auth.ts
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, user, user_role } from "@/db";

/* -------------------- Types -------------------- */

interface AppJwtPayload extends JwtPayload {
  userId: string;
  role: user_role;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  role: user_role;
  isActive: boolean;
  avatar: string | null;
  createdAt: Date;
}

/* -------------------- Core Auth -------------------- */

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AppJwtPayload;

    if (!decoded?.userId) return null;

    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, BigInt(decoded.userId)),
      columns: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!foundUser || !foundUser.isActive) return null;

    return {
      ...foundUser,
      id: foundUser.id.toString(),
    };
  } catch {
    return null;
  }
}

/* -------------------- Guards -------------------- */

export async function requireAuth(): Promise<AuthUser | null> {
  return getCurrentUser();
}

export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== user_role.ADMIN) return null;
  return user;
}

export async function requireUser(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

/* -------------------- Token Utilities -------------------- */

export function generateToken(userId: string, role: user_role): string {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
