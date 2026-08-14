"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";

export default function SetupBusinessPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    // Validate business name
    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // -----------------------------------------
      // 1. Check authenticated user
      // -----------------------------------------
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);

        setError("Unable to verify your login session.");
        return;
      }

      if (!user) {
        setError("You must be logged in to create a business.");
        return;
      }

      console.log("Creating business for user:", user.id);

      // -----------------------------------------
      // 2. Create business
      // -----------------------------------------
      const { error: businessError } = await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          currency,
        });

      // -----------------------------------------
      // 3. Handle database error
      // -----------------------------------------
      if (businessError) {
        console.error(
          "Business creation error:",
          businessError
        );

        setError(
          businessError.message ||
            "Failed to create business. Please try again."
        );

        return;
      }

      console.log("Business created successfully.");

      // -----------------------------------------
      // 4. Redirect to dashboard
      // -----------------------------------------
      router.replace("/dashboard");

      // Refresh the application state
      router.refresh();
    } catch (err) {
      console.error(
        "Unexpected setup business error:",
        err
      );

      setError(
        "Something went wrong while creating your business. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* --------------------------------------- */}
      {/* Heading */}
      {/* --------------------------------------- */}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Set up your business
        </h1>

        <p className="text-muted-foreground">
          Tell us a little about your business to get
          started with HisabAI.
        </p>
      </div>

      {/* --------------------------------------- */}
      {/* Form */}
      {/* --------------------------------------- */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border p-6"
      >
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Business name *
          </Label>

          <Input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Pavan Technologies"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Business Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Business email
          </Label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="business@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone number
          </Label>

          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Business address
          </Label>

          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Enter your business address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            disabled={loading}
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">
            Currency
          </Label>

          <select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value)
            }
            disabled={loading}
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="INR">
              INR — Indian Rupee
            </option>

            <option value="USD">
              USD — US Dollar
            </option>

            <option value="EUR">
              EUR — Euro
            </option>

            <option value="GBP">
              GBP — British Pound
            </option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Creating business..."
            : "Create business"}
        </Button>
      </form>
    </div>
  );
}