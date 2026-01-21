///Users/xeoren/Desktop/lucky_draw/src/app/api/admin/reports/winners/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
    try {
        const admin = await requireAdmin();
        if (!admin) return errorResponse("Unauthorized", 401);
        const refral_config = await prisma.referral_config.findUnique({ where: { id: 1 } });
        return jsonResponse({
            data: refral_config,
        });
    }
    catch (err) {
        console.error("REPORT WINNERS ERROR:", err);
        return errorResponse("Failed to generate winners report", 500);
    }
}
export async function POST(
    request: NextRequest
) {
    try {
        const admin = await requireAdmin();
        if (!admin) return errorResponse("Unauthorized", 401);

        const body = await request.json();
        const { id, referrerBonus, refereeBonus } = body;

        if (!id) {
            return errorResponse("Setting ID required", 400);
        }

        const settingId = BigInt(id);

        const referral_config = await prisma.referral_config.findUnique({
            where: { id: settingId },
        });

        if (!referral_config) {
            return errorResponse("Setting not found", 404);
        }

        const updatedSetting = await prisma.referral_config.update({
            where: { id: settingId },
            data: { referrerBonus, refereeBonus },
            select: {
                id: true,
                referrerBonus: true,
                refereeBonus: true,
                isActive: true,
            },
        });

        return jsonResponse({
            message: "Setting updated successfully",
            user: updatedSetting,
        });
    } catch (error) {
        console.error("ADMIN UPDATE SETTING ERROR:", error);
        return errorResponse("Failed to update setting", 500);
    }
}

