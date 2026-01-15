// src/app/admin/reports/page.tsx
"use client";

import Link from "next/link";
import { PageHeader, Card } from "@/components/ui";
import { Gift, DollarSign, Users, Trophy, ArrowRight } from "lucide-react";

export default function ReportsIndex() {
  const cards = [
    {
      title: "Draws Report",
      desc: "All draws, status & ticket counts",
      href: "/admin/reports/draws",
      icon: Gift,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Sales Report",
      desc: "Approved payments & revenue",
      href: "/admin/reports/sales",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Users Report",
      desc: "Users activity & ticket usage",
      href: "/admin/reports/users",
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Winners Report",
      desc: "Declared winners & prizes",
      href: "/admin/reports/winners",
      icon: Trophy,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View detailed reports and analytics"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card hover className="group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-slate-900">
                      {c.title}
                    </h2>
                    <p className="text-sm text-gray-600">{c.desc}</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
