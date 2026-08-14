"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  ChevronDown,
  Building2,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface DashboardHeaderProps {
  businessName: string | null;
  businessType: string | null;
  userName: string | null;
  userEmail: string | null;
  allBusinesses?: Array<{
    id: number;
    name: string;
    businessType?: string | null;
  }>;
  dateFilter?: React.ReactNode;
}

function getInitials(name: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export function DashboardHeader({
  businessName,
  businessType,
  userName,
  userEmail,
  allBusinesses = [],
  dateFilter,
}: DashboardHeaderProps) {
  const router = useRouter();
  usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const showMobileMenu = () => {
    const sidebar =
      document.querySelector<HTMLElement>('[data-slot="app-sidebar"]');
    if (sidebar) {
      const isHidden = sidebar.classList.contains("hidden");
      if (isHidden) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add(
          "fixed",
          "inset-y-0",
          "left-0",
          "z-50",
          "flex",
        );
      } else {
        sidebar.classList.add("hidden");
        sidebar.classList.remove(
          "fixed",
          "inset-y-0",
          "left-0",
          "z-50",
          "flex",
        );
      }
      setMobileNavOpen(!isHidden);
    }
  };

  return (
    <header className="flex h-16 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={showMobileMenu}
        aria-label="Toggle menu"
        aria-expanded={mobileNavOpen}
      >
        {mobileNavOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-2 px-2 py-1.5 sm:w-auto sm:min-w-0"
              aria-label="Business switcher"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 text-left sm:flex-none">
                <p className="truncate text-sm font-semibold leading-tight">
                  {businessName || "Select business"}
                </p>
                {businessType && (
                  <p className="truncate text-xs text-muted-foreground leading-tight">
                    {businessType}
                  </p>
                )}
              </div>
              {allBusinesses.length > 1 && (
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              )}
            </Button>
          </DropdownMenuTrigger>
          {allBusinesses.length > 1 && (
            <DropdownMenuContent align="start" className="w-[240px]">
              <DropdownMenuLabel>Your businesses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {allBusinesses.map((b) => {
                  const isActive = b.name === businessName;
                  return (
                    <DropdownMenuItem
                      key={b.id}
                      className={cn(
                        "flex items-start gap-2",
                        isActive && "bg-accent/50",
                      )}
                      onClick={() => {
                        router.refresh();
                      }}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {b.name}
                        </p>
                        {b.businessType && (
                          <p className="truncate text-xs text-muted-foreground">
                            {b.businessType}
                          </p>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href="/setup-business"
                  className="flex w-full items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Create new business</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>

      {dateFilter && <div className="hidden md:block">{dateFilter}</div>}

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="h-8 gap-2 px-1 pr-2 sm:pr-2.5"
              aria-label="User profile menu"
            >
              <Avatar size="sm">
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {userName?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 opacity-50 sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {userName || "User"}
                </p>
                {userEmail && (
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {userEmail}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href="/settings"
                className="flex w-full items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>
                {loggingOut ? "Signing out..." : "Sign out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
