import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth"; // Your auth helper
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { generateDrawWinners } from "@/services/winner-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify Admin Authentication
    const admin = await requireAdmin();
    if (!admin) {
      return errorResponse("Unauthorized: Admin access required", 401);
    }

    // 2. Get Draw ID from params
    const { id } = await params;
    if (!id) {
      return errorResponse("Draw ID is required", 400);
    }

    // 3. Execute Service Logic
    const result = await generateDrawWinners(id, admin.id);

    // 4. Return Success
    return jsonResponse({
      message: "Winners generated successfully",
      data: result,
    });

  } catch (error: unknown) { 
  console.error("[GENERATE_WINNERS_ERROR]", error);
  
  // Safely extract the message
  const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
  
  return errorResponse(errorMessage, 500);
}
}