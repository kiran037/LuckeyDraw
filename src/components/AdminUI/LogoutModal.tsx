// src/components/AdminUI/LogoutModal.tsx
"use client";

import { LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fade-in 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "slide-up 0.3s ease-out" }}
      >
        {/* Icon Header */}
        <div className="pt-8 pb-4 px-6">
          <div
            className="flex items-center justify-center w-20 h-20 mx-auto rounded-full"
            style={{
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            }}
          >
            <LogOut className="text-red-600" size={32} strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "#111827" }}
          >
            Sign Out?
          </h2>
          <p
            className="text-center mt-3 leading-relaxed"
            style={{ color: "#6b7280", fontSize: "15px" }}
          >
            You'll need to sign in again to access your account
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 px-6 pb-6">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px 20px",
              backgroundColor: "#f3f4f6",
              color: "#111827",
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "15px",
              border: "2px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
          >
            Cancel
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              color: "#ffffff",
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)";
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(220, 38, 38, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(220, 38, 38, 0.3)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}