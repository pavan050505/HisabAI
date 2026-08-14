import { format } from "date-fns";
import type { BusinessInfo, DateRange, UserProfile } from "../types";
import { formatRangeDisplay } from "../calculations/date-ranges";

interface WelcomeSectionProps {
  profile: UserProfile | null;
  business: BusinessInfo | null;
  range: DateRange;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeSection({
  profile,
  business,
  range,
}: WelcomeSectionProps) {
  const userName = profile?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();

  const businessName = business?.name || "Your business";
  const rangeDisplay = formatRangeDisplay(range);
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <section className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {greeting}, {userName}{" "}
        <span aria-hidden="true">👋</span>
      </h1>

      <p className="text-muted-foreground text-sm sm:text-base">
        Here&apos;s how <span className="font-medium text-foreground">{businessName}</span> is
        performing for <span className="font-medium text-foreground">{rangeDisplay}</span>.
      </p>

      <p className="text-xs text-muted-foreground">
        {today}
      </p>
    </section>
  );
}
