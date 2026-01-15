// // src/app/api/me/route.ts
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { getCurrentUser } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

// /* ===================== GET: CURRENT USER ===================== */

// export async function GET() {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     console.error("GET /api/me ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// /* ===================== PATCH: UPDATE PROFILE ===================== */

// export async function PATCH(req: Request) {
//   try {
//     const authUser = await getCurrentUser();

//     if (!authUser) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const body: {
//       name?: string;
//       email?: string;
//       currentPassword?: string;
//       newPassword?: string;
//     } = await req.json();

//     const updateData: {
//       name?: string;
//       email?: string;
//       password?: string;
//     } = {};

//     /* ---------- NAME ---------- */
//     if (body.name) {
//       updateData.name = body.name;
//     }

//     /* ---------- EMAIL ---------- */
//     if (body.email) {
//       const existingEmail = await prisma.user.findUnique({
//         where: { email: body.email },
//         select: { id: true },
//       });

//       if (
//         existingEmail &&
//         existingEmail.id.toString() !== authUser.id
//       ) {
//         return NextResponse.json(
//           { success: false, message: "Email already in use" },
//           { status: 409 }
//         );
//       }

//       updateData.email = body.email;
//     }

//     /* ---------- PASSWORD ---------- */
//     if (body.newPassword) {
//       if (!body.currentPassword) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Current password is required",
//           },
//           { status: 400 }
//         );
//       }

//       const existingUser = await prisma.user.findUnique({
//         where: { id: BigInt(authUser.id) },
//         select: { password: true },
//       });

//       if (!existingUser) {
//         return NextResponse.json(
//           { success: false, message: "User not found" },
//           { status: 404 }
//         );
//       }

//       const isMatch = await bcrypt.compare(
//         body.currentPassword,
//         existingUser.password
//       );

//       if (!isMatch) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Current password is incorrect",
//           },
//           { status: 401 }
//         );
//       }

//       updateData.password = await bcrypt.hash(
//         body.newPassword,
//         10
//       );
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: BigInt(authUser.id) },
//       data: updateData,
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         mobile: true,
//         role: true,
//         isActive: true,
//         createdAt: true,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Profile updated successfully",
//       data: {
//         ...updatedUser,
//         id: updatedUser.id.toString(),
//       },
//     });
//   } catch (error) {
//     console.error("PATCH /api/me ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Strict type definition
interface UserUpdateData {
  name?: string;
  avatar?: string | null;
  email?: string;
  mobile?: string;
  password?: string;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // FIX: Use strict type instead of 'any'
    const updateData: UserUpdateData = {};

    // --- 1. Basic Info ---
    if (body.name) updateData.name = body.name;
    
    // Handle Avatar
    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar;
    }

    // --- 2. Unique Fields ---
    if (body.email) {
      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing && existing.id.toString() !== authUser.id) {
        return NextResponse.json({ success: false, message: "Email already taken" }, { status: 409 });
      }
      updateData.email = body.email;
    }

    if (body.mobile) {
      const existing = await prisma.user.findUnique({ where: { mobile: body.mobile } });
      if (existing && existing.id.toString() !== authUser.id) {
        return NextResponse.json({ success: false, message: "Mobile number already taken" }, { status: 409 });
      }
      updateData.mobile = body.mobile;
    }

    // --- 3. Password ---
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ success: false, message: "Current password required" }, { status: 400 });
      }

      const dbUser = await prisma.user.findUnique({ 
        where: { id: BigInt(authUser.id) },
        select: { password: true } 
      });

      if (!dbUser || !(await bcrypt.compare(body.currentPassword, dbUser.password))) {
        return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 401 });
      }

      updateData.password = await bcrypt.hash(body.newPassword, 10);
    }

    // --- 4. Execute Update ---
    const updatedUser = await prisma.user.update({
      where: { id: BigInt(authUser.id) },
      data: updateData,
      select: {
        id: true, name: true, email: true, mobile: true, 
        role: true, avatar: true, wallet: true, createdAt: true 
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: { ...updatedUser, id: updatedUser.id.toString() },
    });

  } catch (error) {
    console.error("PATCH PROFILE ERROR:", error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}