import { test, describe } from "node:test";
import assert from "node:assert";
import path from "path";

describe("Application Security Validation Suite", () => {
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function validateUpload({
    filename,
    mimeType,
    sizeBytes,
  }: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    if (sizeBytes > MAX_FILE_SIZE) {
      return { valid: false, error: "File exceeds 5MB limit" };
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return { valid: false, error: "Invalid MIME type" };
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: "Invalid file extension" };
    }

    // Path traversal sanitization
    const sanitizedName = path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, "_");

    return { valid: true, sanitizedName };
  }

  test("accepts valid image formats within size boundary", () => {
    const result = validateUpload({
      filename: "payment_proof.png",
      mimeType: "image/png",
      sizeBytes: 2 * 1024 * 1024,
    });

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitizedName, "payment_proof.png");
  });

  test("rejects executable or script files masquerading as images", () => {
    const scriptAttempt = validateUpload({
      filename: "exploit.php.jpg",
      mimeType: "application/x-php",
      sizeBytes: 1024,
    });
    assert.strictEqual(scriptAttempt.valid, false);
    assert.strictEqual(scriptAttempt.error, "Invalid MIME type");

    const htmlAttempt = validateUpload({
      filename: "payload.html",
      mimeType: "text/html",
      sizeBytes: 500,
    });
    assert.strictEqual(htmlAttempt.valid, false);
  });

  test("rejects files exceeding 5MB limit", () => {
    const oversized = validateUpload({
      filename: "huge_video.mp4",
      mimeType: "video/mp4",
      sizeBytes: 10 * 1024 * 1024,
    });
    assert.strictEqual(oversized.valid, false);
    assert.strictEqual(oversized.error, "File exceeds 5MB limit");
  });

  test("strips directory traversal attempts from filenames", () => {
    const traversal = validateUpload({
      filename: "../../../etc/passwd.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1024,
    });
    assert.strictEqual(traversal.valid, true);
    assert.strictEqual(traversal.sanitizedName, "passwd.jpg");
    assert.ok(!traversal.sanitizedName.includes(".."));
  });

  test("masks mobile numbers for privacy in referrals", () => {
    function maskMobile(mobile: string) {
      return mobile.replace(/.(?=.{4})/g, "*");
    }

    assert.strictEqual(maskMobile("9876543210"), "******3210");
    assert.strictEqual(maskMobile("+919876543210"), "*********3210");
  });
});
