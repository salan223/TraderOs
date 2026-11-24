import type { ReactNode } from "react";
import type { VisualId } from "@/lib/academy/types";
import { DataBadge } from "@/components/ui/data-badge";

/*
  Lesson diagrams as inline SVG. Colours come from the design tokens via
  Tailwind fill/stroke classes. Any diagram with numbers carries a "Sample"
  badge: the numbers are illustrative, not market data.
*/

const BOX = "fill-raised stroke-line-strong";
const TXT = "fill-fg text-[11px]";
const SUB = "fill-fg-subtle text-[9px]";
const ACC = "fill-accent-soft stroke-accent";

function Arrow({ x1, y1, x2, y2, className = "stroke-fg-subtle" }: { x1: number; y1: number; x2: number; y2: number; className?: string }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className={className} strokeWidth={1.25} markerEnd="url(#arrowhead)" />;
}

function Defs() {
  return (
    <defs>
      <marker id="arrowhead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L8,4 L0,8 z" className="fill-fg-subtle" />
      </marker>
    </defs>
  );
}

function Svg({ title, children, h = 180 }: { title: string; children: ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 360 ${h}`} role="img" aria-label={title} className="h-auto w-full max-w-[560px]" fontFamily="var(--font-sans)">
      <Defs />
      {children}
    </svg>
  );
}

function MarketMeeting() {
  return (
    <Svg title="Buyers and sellers send orders to a market, which matches them at an agreed price" h={170}>
      <rect x="8" y="40" width="88" height="60" rx="8" className={BOX} />
      <text x="52" y="66" textAnchor="middle" className={TXT}>Buyers</text>
      <text x="52" y="82" textAnchor="middle" className={SUB}>want to buy</text>
      <rect x="132" y="30" width="96" height="80" rx="10" className={ACC} />
      <text x="180" y="62" textAnchor="middle" className={TXT}>Market</text>
      <text x="180" y="78" textAnchor="middle" className={SUB}>matches orders</text>
      <rect x="264" y="40" width="88" height="60" rx="8" className={BOX} />
      <text x="308" y="66" textAnchor="middle" className={TXT}>Sellers</text>
      <text x="308" y="82" textAnchor="middle" className={SUB}>want to sell</text>
      <Arrow x1={98} y1={70} x2={128} y2={70} />
      <Arrow x1={262} y1={70} x2={232} y2={70} />
      <text x="113" y="62" textAnchor="middle" className={SUB}>buy</text>
      <text x="247" y="62" textAnchor="middle" className={SUB}>sell</text>
      <Arrow x1={180} y1={112} x2={180} y2={132} />
      <rect x="110" y="136" width="140" height="26" rx="6" className={BOX} />
      <text x="180" y="153" textAnchor="middle" className={TXT}>Agreed price → trade</text>
    </Svg>
  );
}

function SupplyDemand() {
  return (
    <Svg title="Supply and demand curves. When demand shifts right, the price where they meet rises" h={200}>
      <line x1="40" y1="20" x2="40" y2="170" className="stroke-line-strong" />
      <line x1="40" y1="170" x2="340" y2="170" className="stroke-line-strong" />
      <text x="14" y="95" className={SUB} transform="rotate(-90 14 95)" textAnchor="middle">Price</text>
      <text x="190" y="190" className={SUB} textAnchor="middle">Quantity</text>
      {/* Supply: rising */}
      <line x1="60" y1="160" x2="300" y2="30" className="stroke-fg-muted" strokeWidth={1.75} />
      <text x="304" y="30" className={TXT}>Supply</text>
      {/* Demand: falling */}
      <line x1="60" y1="40" x2="260" y2="160" className="stroke-accent" strokeWidth={1.75} />
      <text x="208" y="168" className="fill-accent-strong text-[10px]">Demand</text>
      {/* Demand after an increase */}
      <line x1="120" y1="40" x2="320" y2="160" className="stroke-accent" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x="282" y="138" className="fill-accent-strong text-[10px]">More demand</text>
      {/* Equilibria: intersections computed from the line equations */}
      <circle cx="165.1" cy="103.1" r="3.5" className="fill-fg" />
      <circle cx="196.6" cy="86" r="3.5" className="fill-accent-strong" />
      <line x1="40" y1="103.1" x2="165.1" y2="103.1" className="stroke-line-strong" strokeDasharray="2 3" />
      <line x1="40" y1="86" x2="196.6" y2="86" className="stroke-line-strong" strokeDasharray="2 3" />
      <text x="44" y="114" className={SUB}>old price</text>
      <text x="44" y="82" className={SUB}>new, higher price</text>
    </Svg>
  );
}

function ParticipantsMap() {
  const nodes = [
    { x: 180, y: 22, t: "Central banks" },
    { x: 300, y: 55, t: "Banks" },
    { x: 300, y: 125, t: "Funds" },
    { x: 180, y: 158, t: "Companies" },
    { x: 60, y: 125, t: "Market makers" },
    { x: 60, y: 55, t: "Retail traders" },
  ];
  return (
    <Svg title="Market participants around a central market: central banks, banks, funds, companies, market makers and retail traders" h={180}>
      {nodes.map((n) => (
        <line key={n.t} x1={180} y1={90} x2={n.x} y2={n.y} className="stroke-line-strong" />
      ))}
      <circle cx="180" cy="90" r="30" className={ACC} />
      <text x="180" y="94" textAnchor="middle" className={TXT}>Market</text>
      {nodes.map((n) => (
        <g key={n.t}>
          <rect x={n.x - 48} y={n.y - 12} width="96" height="24" rx="6" className={BOX} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-fg text-[10px]">{n.t}</text>
        </g>
      ))}
      <text x="60" y="84" textAnchor="middle" className={SUB}>via a broker</text>
    </Svg>
  );
}

function ShareOwnership() {
  const owned = 3;
  return (
    <Svg title="A company split into 20 equal shares. You own 3, which is 15 percent" h={130}>
      <text x="12" y="20" className={TXT}>Example company: 20 shares</text>
      {Array.from({ length: 20 }, (_, i) => (
        <rect
          key={i}
          x={12 + (i % 10) * 34}
          y={32 + Math.floor(i / 10) * 34}
          width="28"
          height="28"
          rx="4"
          className={i < owned ? "fill-accent stroke-accent-strong" : BOX}
        />
      ))}
      <text x="12" y="120" className={SUB}>You own 3 of 20 shares = 3 ÷ 20 = 15% of the company (hypothetical numbers)</text>
    </Svg>
  );
}

function CurrencyPair() {
  return (
    <Svg title="Anatomy of the quote EUR/USD 1.1000: EUR is the base, USD is the quote, the fourth decimal is the pip" h={125}>
      <text x="40" y="70" className="fill-fg font-mono text-[28px]">EUR</text>
      <text x="104" y="70" className="fill-fg-subtle font-mono text-[28px]">/</text>
      <text x="124" y="70" className="fill-fg font-mono text-[28px]">USD</text>
      <text x="210" y="70" className="fill-fg font-mono text-[28px]">1.100</text>
      <text x="300" y="70" className="fill-accent-strong font-mono text-[28px]">0</text>
      <line x1="40" y1="82" x2="96" y2="82" className="stroke-accent" strokeWidth={2} />
      <line x1="124" y1="82" x2="180" y2="82" className="stroke-fg-subtle" strokeWidth={2} />
      <text x="68" y="100" textAnchor="middle" className={TXT}>Base</text>
      <text x="68" y="113" textAnchor="middle" className={SUB}>1 unit of this…</text>
      <text x="152" y="100" textAnchor="middle" className={TXT}>Quote</text>
      <text x="152" y="113" textAnchor="middle" className={SUB}>…costs this much</text>
      <text x="252" y="100" textAnchor="middle" className={TXT}>Price</text>
      <text x="252" y="113" textAnchor="middle" className={SUB}>1 EUR = 1.10 USD</text>
      <Arrow x1={309} y1={30} x2={309} y2={44} />
      <text x="309" y="24" textAnchor="middle" className="fill-accent-strong text-[10px]">pip (0.0001)</text>
    </Svg>
  );
}

function IndexBasket() {
  const parts = [
    { t: "A", w: 30 },
    { t: "B", w: 22 },
    { t: "C", w: 16 },
    { t: "D", w: 12 },
    { t: "E", w: 10 },
    { t: "F", w: 10 },
  ];
  let x = 12;
  return (
    <Svg title="An index made of six example companies. Company A has the largest weight at 30 percent" h={140}>
      <text x="12" y="20" className={TXT}>Example market-cap-weighted index (illustrative weights)</text>
      {parts.map((p, i) => {
        const w = (p.w / 100) * 336;
        const el = (
          <g key={p.t}>
            <rect x={x} y="34" width={w - 2} height="40" rx="4" className={i === 0 ? "fill-accent stroke-accent-strong" : i < 3 ? ACC : BOX} />
            <text x={x + w / 2 - 1} y="52" textAnchor="middle" className="fill-fg text-[11px]">{p.t}</text>
            <text x={x + w / 2 - 1} y="66" textAnchor="middle" className="fill-fg-muted text-[9px]">{p.w}%</text>
          </g>
        );
        x += w;
        return el;
      })}
      <Arrow x1={180} y1={80} x2={180} y2={100} />
      <rect x="110" y="104" width="140" height="26" rx="6" className={BOX} />
      <text x="180" y="121" textAnchor="middle" className={TXT}>One index value</text>
    </Svg>
  );
}

function CommodityGroups() {
  const groups = [
    { t: "Energy", items: ["Heating oil", "Gasoline", "Coal"] },
    { t: "Metals", items: ["Silver", "Platinum", "Aluminium"] },
    { t: "Agriculture", items: ["Corn", "Soybeans", "Sugar"] },
  ];
  return (
    <Svg title="Commodity groups: energy, metals and agriculture, with examples" h={150}>
      {groups.map((g, i) => (
        <g key={g.t}>
          <rect x={10 + i * 118} y="12" width="104" height="126" rx="8" className={BOX} />
          <rect x={10 + i * 118} y="12" width="104" height="28" rx="8" className={ACC} />
          <text x={62 + i * 118} y="31" textAnchor="middle" className={TXT}>{g.t}</text>
          {g.items.map((it, j) => (
            <text key={it} x={62 + i * 118} y={64 + j * 24} textAnchor="middle" className="fill-fg-muted text-[10px]">{it}</text>
          ))}
        </g>
      ))}
    </Svg>
  );
}

function BlockchainChain() {
  const blocks = [
    { n: 101, prev: "7f3a…", h: "c91e…" },
    { n: 102, prev: "c91e…", h: "04bd…" },
    { n: 103, prev: "04bd…", h: "e57c…" },
  ];
  return (
    <Svg title="Three linked blocks. Each block stores the fingerprint (hash) of the previous block" h={140}>
      {blocks.map((b, i) => {
        const x = 8 + i * 120;
        return (
          <g key={b.n}>
            <rect x={x} y="20" width="104" height="92" rx="8" className={i === 2 ? ACC : BOX} />
            <text x={x + 10} y="40" className={TXT}>Block {b.n}</text>
            <text x={x + 10} y="58" className={SUB}>prev: <tspan className="font-mono">{b.prev}</tspan></text>
            <text x={x + 10} y="74" className={SUB}>transactions…</text>
            <text x={x + 10} y="96" className={SUB}>hash: <tspan className="font-mono">{b.h}</tspan></text>
            {i < 2 && <Arrow x1={x + 106} y1={66} x2={x + 118} y2={66} />}
          </g>
        );
      })}
      <text x="180" y="132" textAnchor="middle" className={SUB}>Changing an old block changes its hash and breaks every link after it.</text>
    </Svg>
  );
}

function TimeHorizons() {
  const ticks = ["Minutes", "Hours", "Days", "Weeks", "Months", "Years", "Decades"];
  const tx = (i: number) => 30 + i * 50;
  const bars = [
    { t: "Day trading", a: 0, b: 1.4 },
    { t: "Swing trading", a: 2, b: 3.4 },
    { t: "Position trading", a: 3, b: 4.6 },
    { t: "Investing", a: 5, b: 6 },
  ];
  return (
    <Svg title="Holding periods: day trading lasts minutes to hours, swing trading days to weeks, position trading weeks to months, investing years to decades" h={170}>
      <line x1="30" y1="140" x2="330" y2="140" className="stroke-line-strong" />
      {ticks.map((t, i) => (
        <g key={t}>
          <line x1={tx(i)} y1="136" x2={tx(i)} y2="144" className="stroke-line-strong" />
          <text x={tx(i)} y="158" textAnchor="middle" className={SUB}>{t}</text>
        </g>
      ))}
      {bars.map((b, i) => (
        <g key={b.t}>
          <rect x={tx(b.a) - 6} y={18 + i * 28} width={(b.b - b.a) * 50 + 12} height="18" rx="5" className={i === 3 ? "fill-accent stroke-accent-strong" : ACC} />
          <text x={i === 3 ? tx(b.a) - 12 : tx(b.b) + 12} y={31 + i * 28} textAnchor={i === 3 ? "end" : "start"} className="fill-fg text-[10px]">{b.t}</text>
        </g>
      ))}
    </Svg>
  );
}

function BidAskSpread() {
  const asks = ["1.2504", "1.2503", "1.2502"];
  const bids = ["1.2500", "1.2499", "1.2498"];
  return (
    <Svg title="Price ladder with asks above and bids below. Best ask 1.2502, best bid 1.2500, spread 0.0002" h={200}>
      <text x="90" y="16" textAnchor="middle" className={SUB}>Sellers&apos; prices (ask)</text>
      {asks.map((p, i) => (
        <g key={p}>
          <rect x="40" y={22 + i * 24} width="100" height="20" rx="4" className={i === 2 ? "fill-accent-soft stroke-accent" : BOX} />
          <text x="90" y={36 + i * 24} textAnchor="middle" className="fill-fg font-mono text-[11px]">{p}</text>
        </g>
      ))}
      {bids.map((p, i) => (
        <g key={p}>
          <rect x="40" y={110 + i * 24} width="100" height="20" rx="4" className={i === 0 ? "fill-info-soft stroke-info" : BOX} />
          <text x="90" y={124 + i * 24} textAnchor="middle" className="fill-fg font-mono text-[11px]">{p}</text>
        </g>
      ))}
      <text x="90" y="194" textAnchor="middle" className={SUB}>Buyers&apos; prices (bid)</text>
      <path d="M148 80 h10 v42 h-10" className="fill-none stroke-fg-subtle" />
      <text x="166" y="98" className={TXT}>Spread = 0.0002</text>
      <text x="166" y="112" className={SUB}>(2 pips, a cost of trading now)</text>
      <text x="166" y="58" className="fill-accent-strong text-[10px]">Buy now → pay best ask</text>
      <text x="166" y="148" className="fill-info text-[10px]">Sell now → receive best bid</text>
    </Svg>
  );
}

const VISUALS: Record<VisualId, { el: () => ReactNode; sample: boolean }> = {
  "market-meeting": { el: MarketMeeting, sample: false },
  "supply-demand": { el: SupplyDemand, sample: true },
  "participants-map": { el: ParticipantsMap, sample: false },
  "share-ownership": { el: ShareOwnership, sample: true },
  "currency-pair": { el: CurrencyPair, sample: true },
  "index-basket": { el: IndexBasket, sample: true },
  "commodity-groups": { el: CommodityGroups, sample: false },
  "blockchain-chain": { el: BlockchainChain, sample: true },
  "time-horizons": { el: TimeHorizons, sample: false },
  "bid-ask-spread": { el: BidAskSpread, sample: true },
};

export const VISUAL_IDS = Object.keys(VISUALS) as VisualId[];

export function Visual({ id, caption }: { id: VisualId; caption: string }) {
  const v = VISUALS[id];
  if (!v) return null;
  const El = v.el;
  return (
    <figure className="max-w-[74ch] overflow-hidden rounded-lg border border-line bg-surface p-3 sm:p-4">
      {v.sample && (
        <div className="mb-2 flex justify-end">
          <DataBadge source="sample" />
        </div>
      )}
      <div className="flex justify-center">
        <El />
      </div>
      <figcaption className="t-small mt-2">{caption}</figcaption>
    </figure>
  );
}
