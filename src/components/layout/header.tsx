"use client";

import { useState } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoading(false);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search HisabAI..."
          className="pl-9"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Logout"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="h-5 w-5" />
        </Button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          U
        </div>
      </div>
    </header>
  );
}