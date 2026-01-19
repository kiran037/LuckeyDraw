"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Lock, Mail } from "lucide-react";
import { api } from "@/lib/api-client";
import { useSearchParams } from "next/navigation";
import BentoInput from "../LandingUI/BentoInput";
import GradientButton from "../LandingUI/GradientButton";
import { Gift } from "lucide-react";


export default function RegisterForm() {
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    referralCode: referralFromUrl || "",
  });

  const validate = () => {
    if (!formData.name.trim()) {
      return "Name is required";
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      return "Enter a valid 10-digit mobile number";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Enter a valid email address";
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
      const res = await api.post<{ id: string }>("/auth/register", formData);

      if (res.success) {
        router.push("/signin?registered=true");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch {
      setError("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <BentoInput
        icon={User}
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <BentoInput
        icon={Phone}
        label="Mobile Number"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        placeholder="9876543210"
        value={formData.mobile}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          if (value.length <= 10) {
            setFormData({ ...formData, mobile: value });
          }
        }}
        required
      />

      <BentoInput
        icon={Mail}
        label="Email (Optional)"
        type="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <BentoInput
        icon={Lock}
        label="Password"
        type="password"
        minLength={8}
        placeholder="Minimum 8 characters"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <BentoInput
        icon={Gift}
        label="Referral Code (Optional)"
        type="text"
        placeholder="Enter referral code"
        value={formData.referralCode}
        onChange={(e) =>
          setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })
        }
      />
      <GradientButton type="submit" loading={loading}>
        Create Account
      </GradientButton>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-bold text-gray-900 dark:text-white hover:underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
