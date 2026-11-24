import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import { DASHBOARD_PATH, isPublicPath, isSignedOutOnly } from "@/lib/auth/routes";

/*
  Runs before every page request (static files are excluded by the matcher).
  1. Refreshes the Supabase session cookie, so server code sees a valid user.
  2. Sends signed-out visitors of app pages to /login?next=<where they were going>.
  3. Sends signed-in visitors of / and the sign-in pages to the dashboard.
  With Supabase not configured, everything is allowed (guest mode). With
  TRADEROS_ALLOW_GUESTS=1, signed-out visitors may also use the app as guests.
*/
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  const path = request.nextUrl.pathname;
  // Market data and news APIs are public and need no session.
  if (path.startsWith("/api/market") || path.startsWith("/api/news")) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() checks the token with Supabase (unlike getSession), and refreshes it if needed.
  let signedIn = false;
  try {
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    signedIn = false;
  }

  const redirect = (to: URL) => {
    const r = NextResponse.redirect(to);
    // Keep any refreshed session cookies on the redirect too.
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (signedIn && (path === "/" || isSignedOutOnly(path))) {
    return redirect(new URL(DASHBOARD_PATH, request.url));
  }

  const guestsAllowed = process.env.TRADEROS_ALLOW_GUESTS === "1";
  if (!signedIn && !isPublicPath(path) && !path.startsWith("/api/") && !guestsAllowed) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path + request.nextUrl.search);
    return redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and files with an extension (images, fonts, icons).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?)$).*)",
  ],
};
