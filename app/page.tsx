import type { Metadata } from "next";
import { Landing } from "@/components/landing/landing";

export const metadata: Metadata = {
  title: { absolute: "Trader OS · Learn to trade before you risk real money" },
  description: "A structured trading academy with simulated practice tools. Education only: no real orders, no signals, no tips.",
};

/** Public landing page. Signed-in visitors see it too, with a link back to their dashboard. */
export default function HomePage() {
  return <Landing />;
}
