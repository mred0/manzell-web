import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "@/lib/supabase/config";

// Gates everything under /admin behind a logged-in Supabase session, and
// refreshes the session cookie on every request (required by @supabase/ssr
// so a session doesn't silently expire mid-visit). Admin accounts are
// created directly in the Supabase dashboard (Authentication → Users) —
// there's no public sign-up flow, see SUPABASE_SETUP.md.
//
// Named `proxy` (not `middleware`) and living at src/proxy.ts, not
// src/middleware.ts — Next.js 16 renamed this file convention; the old
// name still works but is deprecated (see AGENTS.md for why this repo
// follows framework docs rather than training-data conventions).
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isSupabaseConfigured) {
    // Nothing to gate against yet — let the login page itself explain that
    // Supabase needs setting up, rather than redirect-looping.
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
