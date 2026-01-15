import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: LucideIcon;
  trend?: "up" | "down";
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "increase",
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
          <Icon className="text-gray-600" size={20} />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <div className="flex items-end gap-3">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <span className={`text-sm font-semibold pb-1 ${
              changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}>
              {change} {changeType === "increase" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}