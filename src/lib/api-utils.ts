import { NextResponse } from "next/server";

/**
 * Safely converts BigInt values to strings within any object or array.
 * This prevents the "Do not know how to serialize a BigInt" error.
 */
export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

/**
 * A wrapper for NextResponse.json that automatically handles BigInt serialization.
 * Uses 'unknown' instead of 'any' to satisfy ESLint.
 */
export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data: serializeBigInt(data),
    },
    { status }
  );
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