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

    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Get currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to create a business.");
      setLoading(false);
      return;
    }

    // Create business
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

    setLoading(false);

    if (businessError) {
      setError(businessError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Set up your business
        </h1>

        <p className="text-muted-foreground">
          Tell us a little about your business to get started
          with HisabAI.
        </p>
      </div>

      {/* Form */}
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
            type="text"
            placeholder="e.g. Pavan Technologies"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Business email
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="business@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone number
          </Label>

          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Business address
          </Label>

          <Input
            id="address"
            type="text"
            placeholder="Enter your business address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">
            Currency
          </Label>

          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="INR">INR — Indian Rupee</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
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