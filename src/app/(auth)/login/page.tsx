import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back
        </h2>

        <p className="text-sm text-muted-foreground">
          Enter your details to access your HisabAI account.
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      {/* Signup */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}