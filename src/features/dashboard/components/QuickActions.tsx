"use client";

import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Receipt,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  comingSoon?: boolean;
}

const actions: QuickAction[] = [
  {
    label: "Add Income",
    description: "Record a sale or income",
    href: "/transactions",
    icon: ArrowUpRight,
    variant: "primary",
  },
  {
    label: "Add Expense",
    description: "Log a business expense",
    href: "/transactions",
    icon: ArrowDownLeft,
    variant: "outline",
  },
  {
    label: "Add Customer",
    description: "Add a new customer",
    href: "/customers",
    icon: Users,
    variant: "outline",
  },
  {
    label: "Add Sale / Order",
    description: "Coming soon",
    href: "#",
    icon: Receipt,
    variant: "outline",
    disabled: true,
    comingSoon: true,
  },
  {
    label: "Record Payment",
    description: "Log a customer payment",
    href: "/customers",
    icon: Wallet,
    variant: "outline",
  },
];

export function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick actions
        </h2>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.variant === "primary";

          const buttonContent = (
            <div className="flex w-full items-start gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isPrimary
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : action.disabled
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary",
                )}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-left">
                  <span className="font-medium text-sm">
                    {action.label}
                  </span>
                  <Plus
                    className={cn(
                      "h-3 w-3",
                      action.disabled ? "opacity-40" : "opacity-60",
                    )}
                  />
                </div>
                {action.description && (
                  <p
                    className={cn(
                      "text-xs mt-0.5 truncate",
                      action.comingSoon
                        ? "text-primary font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {action.description}
                  </p>
                )}
              </div>
            </div>
          );

          if (action.disabled) {
            return (
              <div key={action.label}>
                <Button
                  variant={isPrimary ? "default" : "outline"}
                  className="h-auto flex-col items-start justify-start gap-2 p-3 sm:p-4 cursor-not-allowed opacity-60"
                  disabled
                  aria-label={action.label}
                >
                  {buttonContent}
                </Button>
              </div>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className="block h-full"
              aria-label={action.label}
            >
              <Button
                variant={isPrimary ? "default" : "outline"}
                className={cn(
                  "h-full w-full flex-col items-start justify-start gap-2 p-3 sm:p-4",
                  isPrimary && "shadow-sm hover:bg-primary/90",
                )}
              >
                {buttonContent}
              </Button>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
