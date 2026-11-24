import {
  LayoutDashboard,
  GraduationCap,
  ChartCandlestick,
  FlaskConical,
  Wallet,
  NotebookPen,
  Sparkles,
  ChartNoAxesCombined,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  /** The build phase in which this module becomes functional. */
  phase: number;
  /** One-line purpose, shown on placeholder pages and tooltips. */
  purpose: string;
  /** Show in the mobile bottom bar (the rest go in "More"). */
  primary?: boolean;
};

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard, phase: 1, primary: true,
    purpose: "Your daily starting point: progress, practice account and what to do next." },
  { href: "/academy", label: "Academy", short: "Learn", icon: GraduationCap, phase: 2, primary: true,
    purpose: "A structured course that teaches trading from zero, with quizzes that measure mastery." },
  { href: "/market-desk", label: "Market Desk", short: "Markets", icon: ChartCandlestick, phase: 3, primary: true,
    purpose: "Charts, watchlists and indicators for studying how real markets move." },
  { href: "/strategy-lab", label: "Strategy Lab", short: "Lab", icon: FlaskConical, phase: 6,
    purpose: "Write simple rule-based strategies and test them on historical data, honestly." },
  { href: "/paper-trading", label: "Paper Trading", short: "Practice", icon: Wallet, phase: 4, primary: true,
    purpose: "Practise with virtual money. No real orders are ever sent." },
  { href: "/journal", label: "Trading Journal", short: "Journal", icon: NotebookPen, phase: 5,
    purpose: "Record every trade, why you took it and how you felt, then learn from patterns." },
  { href: "/mentor", label: "AI Mentor", short: "Mentor", icon: Sparkles, phase: 7,
    purpose: "A tutor that knows your progress and challenges your ideas. It never trades for you." },
  { href: "/analytics", label: "Analytics", short: "Stats", icon: ChartNoAxesCombined, phase: 8,
    purpose: "Measure your practice results with clear explanations of every metric." },
  { href: "/settings", label: "Settings", short: "Settings", icon: Settings, phase: 1,
    purpose: "Account, data sources and preferences." },
];

/** The build phase the app has reached. Sections with phase <= this are working. */
export const CURRENT_PHASE = 3;

/** True when a section is built and usable (not a placeholder). */
export function isBuilt(item: Pick<NavItem, "phase">) {
  return item.phase <= CURRENT_PHASE;
}

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}
