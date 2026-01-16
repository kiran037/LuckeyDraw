import { NextResponse } from "next/server";

/**
 * Safely converts BigInt values to strings within any object or array.
 */
export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

/**
 * Standard JSON response - returns data directly without wrapping
 */
export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(serializeBigInt(data), { status });
}

/**
 * Standardized error response helper.
 */
export function errorResponse(message: string, status = 500) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}