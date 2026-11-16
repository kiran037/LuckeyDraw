import { test, describe } from "node:test";
import assert from "node:assert";
import { SignJWT, jwtVerify } from "jose";

describe("Authentication & Token Verification Suite", () => {
  const secretKey = new TextEncoder().encode("test-secret-key-32-chars-long-abc!");

  test("should correctly sign and verify a user JWT token", async () => {
    const payload = {
      id: "1",
      email: "user@example.com",
      role: "USER",
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);

    assert.ok(token, "Token should be generated");

    const verified = await jwtVerify(token, secretKey);
    assert.strictEqual(verified.payload.id, "1");
    assert.strictEqual(verified.payload.email, "user@example.com");
    assert.strictEqual(verified.payload.role, "USER");
  });

  test("should enforce ADMIN role separation", async () => {
    const adminPayload = {
      id: "99",
      email: "admin@example.com",
      role: "ADMIN",
    };

    const token = await new SignJWT(adminPayload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(secretKey);

    const verified = await jwtVerify(token, secretKey);
    assert.strictEqual(verified.payload.role, "ADMIN");
    assert.notStrictEqual(verified.payload.role, "USER");
  });

  test("should reject tokens with invalid secrets", async () => {
    const token = await new SignJWT({ id: "1", role: "USER" })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secretKey);

    const wrongKey = new TextEncoder().encode("different-secret-key-here-12345678");

    await assert.rejects(
      async () => {
        await jwtVerify(token, wrongKey);
      },
      /signature verification failed/i
    );
  });
});
