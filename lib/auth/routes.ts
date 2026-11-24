/**
 * Route rules shared by the proxy (session refresh and protection) and the
 * app shell (which pages get the sidebar). Pure, so it is safe anywhere.
 */

/** The signed-in home. `/` is the public landing page. */
export const DASHBOARD_PATH = "/dashboard";

/** Pages shown without the app shell (sidebar, top bar). */
export const BARE_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/check-email", "/auth"];

/** Pages and APIs anyone may open without signing in. */
const PUBLIC_PREFIXES = ["/login", "/signup", "/forgot-password", "/check-email", "/auth", "/api/market", "/api/news"];

/** Auth pages a signed-in user is sent away from. /reset-password is not one: the reset link signs you in first. */
export const SIGNED_OUT_ONLY = ["/login", "/signup", "/forgot-password", "/check-email"];

const matches = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "/");

export const isBarePath = (path: string) => path === "/" || BARE_PATHS.some((p) => p !== "/" && matches(path, p));
export const isPublicPath = (path: string) => path === "/" || PUBLIC_PREFIXES.some((p) => matches(path, p));
export const isSignedOutOnly = (path: string) => SIGNED_OUT_ONLY.some((p) => matches(path, p));

/**
 * A safe in-app path to return to after sign-in. Anything that is not a
 * plain local path (another site, protocol-relative, backslashes) falls back
 * to the dashboard, so the parameter cannot be used as an open redirect.
 */
export function safeNext(raw: string | null | undefined, fallback = DASHBOARD_PATH): string {
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || raw.includes("\n") || raw.includes("\r")) return fallback;
  if (isSignedOutOnly(raw.split("?")[0])) return fallback;
  return raw;
}

/**
 * The link target for a nav item. lib/nav.ts still lists the dashboard as "/",
 * which is now the public landing page, so it is pointed at /dashboard here.
 * Once lib/nav.ts says "/dashboard" this is a no-op.
 */
export const appHref = (href: string) => (href === "/" ? DASHBOARD_PATH : href);
