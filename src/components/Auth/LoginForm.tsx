"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import { api } from "@/lib/api-client";
import BentoInput from "../LandingUI/BentoInput";
import GradientButton from "../LandingUI/GradientButton";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Added state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ mobile: "", password: "" });

  const validate = () => {
    if (!/^\d{10}$/.test(formData.mobile)) {
      return "Please enter a valid 10-digit mobile number";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ redirectUrl: string }>(
        "/auth/login",
        formData
      );

      if (res.success) {
        router.push(res.data?.redirectUrl || "/");
        router.refresh();
      } else {
        setError(res.message || "Login failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Mobile Input */}
        <BentoInput
          icon={Phone}
          label="Mobile Number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter 10-digit number"
          value={formData.mobile}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              setFormData({ ...formData, mobile: value });
            }
          }}
          required
        />

        {/* Password Input with Toggle */}
        <div>
          <div className="relative">
            <BentoInput
              icon={Lock}
              label="Password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="pr-10"
            />

            {/* The Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-3.5 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      <GradientButton type="submit" loading={loading}>
        Sign In
      </GradientButton>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-bold text-gray-900 dark:text-white hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
