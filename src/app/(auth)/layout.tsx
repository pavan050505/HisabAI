import type { ReactNode } from "react";
import { WalletCards } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Branding */}
      <div className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <WalletCards className="h-7 w-7" />
          <span className="text-2xl font-bold">HisabAI</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Smart business.
            <br />
            Simple hisab.
          </h1>

          <p className="mt-4 text-primary-foreground/80">
            Manage your income, expenses, invoices and business finances
            from one intelligent platform.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/70">
          © 2026 HisabAI
        </p>
      </div>

      {/* Auth Content */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}