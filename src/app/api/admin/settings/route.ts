import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, referralConfig } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);
    const config = await db.query.referralConfig.findFirst({
      where: eq(referralConfig.id, BigInt(1)),
    });
    return jsonResponse({
      data: config,
    });
  } catch (err) {
    console.error("ADMIN GET SETTINGS ERROR:", err);
    return errorResponse("Failed to fetch settings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const { id, referrerBonus, refereeBonus } = body;

    if (!id) {
      return errorResponse("Setting ID required", 400);
    }

    const settingId = BigInt(id);

    const existingConfig = await db.query.referralConfig.findFirst({
      where: eq(referralConfig.id, settingId),
    });

    if (!existingConfig) {
      return errorResponse("Setting not found", 404);
    }

    const [updatedSetting] = await db
      .update(referralConfig)
      .set({ referrerBonus, refereeBonus })
      .where(eq(referralConfig.id, settingId))
      .returning({
        id: referralConfig.id,
        referrerBonus: referralConfig.referrerBonus,
        refereeBonus: referralConfig.refereeBonus,
        isActive: referralConfig.isActive,
      });

    return jsonResponse({
      message: "Setting updated successfully",
      setting: updatedSetting,
      data: updatedSetting,
      user: updatedSetting,
    });
  } catch (error) {
    console.error("ADMIN UPDATE SETTING ERROR:", error);
    return errorResponse("Failed to update setting", 500);
  }
}
