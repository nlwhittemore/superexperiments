"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/companies", label: "Companies" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-5">
      {items.map((it) => {
        const active =
          it.href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/engagements")
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "border-b-2 px-1 py-1 text-sm transition-colors",
              active
                ? "border-teal text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
