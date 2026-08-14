import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const claimsResult = await supabase.auth.getClaims();
  const claims = claimsResult?.data?.claims;

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/setup-business") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/settings");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup";

  if (!claims && isProtectedRoute) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";

    return NextResponse.redirect(url);
  }

  if (claims && isAuthRoute) {
    const url = request.nextUrl.clone();

    url.pathname = "/dashboard";

    return NextResponse.redirect(url);
  }

  return response;
}
