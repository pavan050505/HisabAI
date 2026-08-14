"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  Users,
  Settings,
  WalletCards,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/setup-business") return;

    let cancelled = false;

    async function checkBusiness() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: businesses } = await supabase
          .from("businesses")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1);

        if (cancelled) return;

        if (!businesses || businesses.length === 0) {
          router.replace("/setup-business");
        }
      } catch {
        // Silent
      }
    }

    checkBusiness();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (pathname === "/setup-business") {
    return null;
  }

  return (
    <aside
      data-slot="app-sidebar"
      className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground"
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0"
        >
          <WalletCards className="h-6 w-6 text-sidebar-primary" />
          <span className="text-xl font-bold tracking-tight">
            HisabAI
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs font-semibold text-sidebar-foreground/80">
          HisabAI
        </p>
        <p className="text-[11px] text-sidebar-foreground/50">
          Smart business. Simple hisab.
        </p>
      </div>
    </aside>
  );
}
