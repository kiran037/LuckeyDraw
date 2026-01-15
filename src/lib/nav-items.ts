// src/lib/nav-items.ts
import {
  LayoutGrid,
  Gift,
  Package,
  CreditCard,
  Ticket,
  Trophy,
  BarChart3,
  User,
  LucideIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  allowedRoles: string[];
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutGrid,
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    label: "Draws",
    href: "/admin/draws",
    icon: Gift,
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    label: "Reports",
    icon: BarChart3,
    allowedRoles: ["ADMIN"],
    children: [
      {
        label: "Overview",
        href: "/admin/reports/draws",
        icon: LayoutGrid,
        allowedRoles: ["ADMIN"],
      },
      {
        label: "All reports",
        href: "/admin/reports/sales",
        icon: BarChart3,
        allowedRoles: ["ADMIN"],
      },
      {
        label: "Your reports",
        href: "/admin/reports/users",
        icon: User,
        allowedRoles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Tickets",
    href: "/admin/tickets",
    icon: Ticket,
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    label: "Winners",
    href: "/admin/winners",
    icon: Trophy,
    allowedRoles: ["USER", "ADMIN"],
  },
];

export const filterMenuByRole = (items: MenuItem[], role: string): MenuItem[] => {
  return items.filter((item) => item.allowedRoles.includes(role));
};