import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Static, labelled diagrams for the Market Structure track, one per core
  concept. Registered as widgets so lessons can place them, but they are
  drawings: each is framed like the shared illustrations ("Illustration ·
  Not real data" and a caption), carries no prices and uses theme tokens.
*/

type FigProps = { title: string; caption: string };
const W = 360;
const SUB = "fill-fg-muted";

function Frame({ id, title, caption, label, h, children }: FigProps & { id: string; label: string; h: number; children: ReactNode }) {
  return (
    <figure className="max-w-[74ch] overflow-hidden rounded-lg border border-line bg-surface px-3 pb-3 pt-2.5 sm:px-4" data-illustration={id} aria-label={title}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="t-label rounded-full border border-line-strong px-2 py-0.5 text-[10px]">Illustration</span>
        <span className="t-small text-xs text-fg-subtle">Not real data</span>
      </div>
      <div className="mx-auto max-w-[540px]">
        <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={label} className="h-auto w-full" fontFamily="var(--font-sans)">
          <defs>
            <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" className="fill-fg-muted" />
            </marker>
          </defs>
          {children}
        </svg>
      </div>
      <figcaption className="t-small mt-2">{caption}</figcaption>
    </figure>
  );
}

function T({ x, y, children, a = "middle", cls = "fill-fg", size = 12, weight }: { x: number; y: number; children: ReactNode; a?: "start" | "middle" | "end"; cls?: string; size?: number; weight?: number }) {
  return <text x={x} y={y} textAnchor={a} className={cls} fontSize={size} fontWeight={weight}>{children}</text>;
}
const Box = ({ x, y, w, h, cls = "fill-raised stroke-line-strong", r = 6 }: { x: number; y: number; w: number; h: number; cls?: string; r?: number }) => <rect x={x} y={y} width={w} height={h} rx={r} className={cn(cls)} strokeWidth={1.25} />;
const Arrow = ({ id, x1, y1, x2, y2, cls = "stroke-fg-muted", dash }: { id: string; x1: number; y1: number; x2: number; y2: number; cls?: string; dash?: string }) => <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={1.5} strokeDasharray={dash} markerEnd={`url(#${id}-arrow)`} />;

// ── L1. Exchange versus dealer market ───────────────────────────────────────

export function FigVenues({ title, caption }: FigProps) {
  const id = "ms-fig-venues";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="Left: on an exchange, many buyers and sellers send orders into one central order book, where they trade with each other. Right: in a dealer market, each client trades with a dealer, and dealers trade with each other.">
      <T x={90} y={16} weight={600}>Exchange</T>
      <Box x={55} y={78} w={70} h={36} cls="fill-accent-soft stroke-accent" />
      <T x={90} y={100} size={11}>Order book</T>
      {[[15, 40], [15, 150], [165, 40], [165, 150], [90, 30], [90, 168]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={9} className={i % 2 ? "fill-up" : "fill-down"} opacity={0.8} />
          <Arrow id={id} x1={x + (x < 90 ? 8 : x > 90 ? -8 : 0)} y1={y + (y < 96 ? 8 : -8)} x2={x < 90 ? 57 : x > 90 ? 123 : 90} y2={y < 96 ? 80 : 112} />
        </g>
      ))}
      <T x={90} y={186} size={10} cls={SUB}>buyers and sellers meet each other</T>
      <line x1={190} x2={190} y1={10} y2={180} className="stroke-line" strokeWidth={1} />
      <T x={275} y={16} weight={600}>Dealer (OTC) market</T>
      <Box x={222} y={70} w={44} h={28} />
      <T x={244} y={88} size={10}>Dealer</T>
      <Box x={290} y={70} w={44} h={28} />
      <T x={312} y={88} size={10}>Dealer</T>
      <line x1={266} x2={290} y1={84} y2={84} className="stroke-accent" strokeWidth={2} />
      <T x={278} y={64} size={9} cls="fill-accent-strong">inter-dealer</T>
      {[[215, 140], [255, 150], [300, 150], [340, 140]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={8} className="fill-fg-subtle" />
          <line x1={x} y1={y - 8} x2={i < 2 ? 244 : 312} y2={98} className="stroke-fg-muted" strokeWidth={1.25} />
        </g>
      ))}
      <T x={278} y={176} size={10} cls={SUB}>clients trade with a dealer</T>
    </Frame>
  );
}

// ── L2. The spread and its parts ────────────────────────────────────────────

export function FigSpread({ title, caption }: FigProps) {
  const id = "ms-fig-spread";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="A line from the bid to the ask with the mid in the middle. The spread is split into three parts: order-processing costs, inventory risk and adverse selection, the losses to better-informed traders.">
      <line x1={40} x2={320} y1={60} y2={60} className="stroke-fg" strokeWidth={2} />
      <circle cx={40} cy={60} r={6} className="fill-up" /><T x={40} y={44} cls="fill-up" weight={600}>Bid</T>
      <circle cx={320} cy={60} r={6} className="fill-down" /><T x={320} y={44} cls="fill-down" weight={600}>Ask</T>
      <line x1={180} x2={180} y1={52} y2={68} className="stroke-accent" strokeWidth={2} /><T x={180} y={44} cls="fill-accent-strong">Mid</T>
      <T x={110} y={82} size={10} cls={SUB}>half-spread</T><T x={250} y={82} size={10} cls={SUB}>half-spread</T>
      <rect x={40} y={100} width={90} height={20} className="fill-fg-subtle" opacity={0.5} />
      <rect x={130} y={100} width={70} height={20} className="fill-warn" opacity={0.6} />
      <rect x={200} y={100} width={120} height={20} className="fill-accent" opacity={0.6} />
      <T x={85} y={138} size={10}>Order processing</T>
      <T x={165} y={152} size={10}>Inventory risk</T>
      <T x={260} y={138} size={10}>Adverse selection</T>
      <T x={180} y={96} size={9} cls={SUB}>what the whole spread pays for (sizes illustrative)</T>
    </Frame>
  );
}

// ── L3. The ladder and depth ────────────────────────────────────────────────

export function FigLadder({ title, caption }: FigProps) {
  const id = "ms-fig-ladder";
  const asks = [90, 60, 110, 40], bids = [70, 100, 50, 120];
  return (
    <Frame id={id} title={title} caption={caption} h={220} label="An order book ladder. Sell orders (asks) are stacked above, the lowest ask nearest the middle. Buy orders (bids) are below, the highest bid nearest the middle. The gap between best bid and best ask is the spread; the size at each level is the depth.">
      {asks.map((q, i) => (
        <g key={`a${i}`}>
          <rect x={180} y={20 + (3 - i) * 22} width={q} height={16} className="fill-down" opacity={0.55} />
          <line x1={120} x2={176} y1={28 + (3 - i) * 22} y2={28 + (3 - i) * 22} className="stroke-line" />
        </g>
      ))}
      {bids.map((q, i) => (
        <g key={`b${i}`}>
          <rect x={180 - q} y={124 + i * 22} width={q} height={16} className="fill-up" opacity={0.55} />
        </g>
      ))}
      <T x={300} y={104} a="start" cls="fill-down" size={11} weight={600}>Best ask</T>
      <Arrow id={id} x1={298} y1={100} x2={272} y2={92} />
      <T x={20} y={136} a="start" cls="fill-up" size={11} weight={600}>Best bid</T>
      <T x={185} y={117} a="start" size={11} weight={600}>Spread</T>
      <line x1={180} x2={180} y1={102} y2={124} className="stroke-accent" strokeWidth={2} />
      <T x={330} y={30} a="end" size={10} cls={SUB}>sellers (asks), higher prices up</T>
      <T x={20} y={214} a="start" size={10} cls={SUB}>buyers (bids), lower prices down</T>
      <T x={300} y={60} a="start" size={10}>depth</T>
      <Arrow id={id} x1={298} y1={58} x2={276} y2={58} />
    </Frame>
  );
}

// ── L3. Price-time priority ─────────────────────────────────────────────────

export function FigQueue({ title, caption }: FigProps) {
  const id = "ms-fig-queue";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Three sell orders wait at the same best price in the order they arrived: first, second and third. An incoming buy order trades with the first one in the queue. A sell order at a higher price waits behind all of them.">
      <T x={20} y={30} a="start" size={11} cls={SUB}>Best ask price</T>
      {["1st", "2nd", "3rd"].map((s, i) => (
        <g key={s}>
          <Box x={120 + i * 70} y={14} w={60} h={28} cls={i === 0 ? "fill-accent-soft stroke-accent" : "fill-raised stroke-line-strong"} />
          <T x={150 + i * 70} y={33} size={11}>{s} in</T>
        </g>
      ))}
      <T x={20} y={92} a="start" size={11} cls={SUB}>Higher ask price</T>
      <Box x={120} y={74} w={60} h={28} /><T x={150} y={93} size={11}>waits</T>
      <Box x={20} y={124} w={86} h={28} cls="fill-up stroke-up" />
      <T x={63} y={143} size={11} cls="fill-canvas" weight={600}>Buy order</T>
      <Arrow id={id} x1={106} y1={130} x2={140} y2={44} cls="stroke-up" />
      <T x={250} y={128} size={11} weight={600}>Price first,</T>
      <T x={250} y={144} size={11} weight={600}>then time</T>
      <T x={330} y={64} a="end" size={10} cls={SUB}>arrival order →</T>
    </Frame>
  );
}

// ── L4. Stops in a gap ──────────────────────────────────────────────────────

export function FigStopGap({ title, caption }: FigProps) {
  const id = "ms-fig-stop-gap";
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="Price drifts down towards a sell stop level, then gaps straight past it. The stop order triggers and becomes a market order, which fills well below the stop. A stop-limit order with its limit at the stop price does not fill at all, because price never trades back up to the limit.">
      <path d="M20,50 L60,58 L100,52 L140,70 L170,76" className="fill-none stroke-fg" strokeWidth={2} />
      <path d="M200,140 L240,150 L280,138 L330,152" className="fill-none stroke-fg" strokeWidth={2} />
      <line x1={170} x2={200} y1={76} y2={140} className="stroke-fg-muted" strokeWidth={1.5} strokeDasharray="3 3" />
      <T x={186} y={112} a="end" size={10} cls={SUB}>gap</T>
      <line x1={20} x2={340} y1={96} y2={96} className="stroke-warn" strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={340} y={90} a="end" size={11} cls="fill-warn" weight={600}>stop price</T>
      <circle cx={204} cy={142} r={6} className="fill-down" />
      <T x={212} y={170} a="start" size={11} cls="fill-down" weight={600}>Stop (market) fills here</T>
      <line x1={204} x2={204} y1={100} y2={134} className="stroke-down" strokeWidth={1.5} markerEnd={`url(#${id}-arrow)`} />
      <T x={300} y={124} size={10} cls={SUB}>slippage</T>
      <T x={20} y={190} a="start" size={11} cls="fill-accent-strong">Stop-limit at the stop price: price never comes back, so no fill.</T>
    </Frame>
  );
}

// ── L5. A market order walks the book ───────────────────────────────────────

export function FigWalk({ title, caption }: FigProps) {
  const id = "ms-fig-walk";
  const lv = [[60, 40], [90, 60], [110, 90]];
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="Ask levels step up in price. A large market buy order takes all of the best level, then all of the next, then part of the third. Its average price is above the best ask; the gap is slippage. The last price paid is higher still.">
      {lv.map(([w, h], i) => (
        <g key={i}>
          <rect x={60 + i * 90} y={170 - h} width={80} height={h} className="fill-down" opacity={i === 2 ? 0.25 : 0.55} />
          <T x={100 + i * 90} y={186} size={10} cls={SUB}>{["best ask", "next level", "third level"][i]}</T>
        </g>
      ))}
      <rect x={240} y={110} width={45} height={60} className="fill-down" opacity={0.55} />
      <line x1={40} x2={340} y1={110} y2={110} className="stroke-accent" strokeWidth={1.5} strokeDasharray="5 3" />
      <T x={40} y={104} a="start" size={11} cls="fill-accent-strong" weight={600}>average price paid</T>
      <line x1={40} x2={140} y1={130} y2={130} className="stroke-fg" strokeWidth={1.5} />
      <T x={40} y={146} a="start" size={10}>best ask when sent</T>
      <line x1={52} x2={52} y1={128} y2={112} className="stroke-warn" strokeWidth={2} />
      <T x={58} y={124} a="start" size={10} cls="fill-warn">slippage</T>
      <T x={330} y={30} a="end" size={11} weight={600}>One big buy order</T>
      <Arrow id={id} x1={250} y1={36} x2={285} y2={70} />
      <T x={300} y={84} a="start" size={10} cls={SUB}>takes</T>
    </Frame>
  );
}

// ── L6. Call auction ────────────────────────────────────────────────────────

export function FigAuction({ title, caption }: FigProps) {
  const id = "ms-fig-auction";
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="A call auction. Price is on the vertical axis and shares on the horizontal. The line of shares people would buy falls as price rises; the line of shares people would sell rises. Where they cross is the auction price, which matches the most shares. Everyone trades at that one price.">
      <line x1={40} x2={40} y1={16} y2={176} className="stroke-line-strong" />
      <line x1={40} x2={340} y1={176} y2={176} className="stroke-line-strong" />
      <T x={30} y={22} a="end" size={10} cls={SUB}>price</T>
      <T x={340} y={192} a="end" size={10} cls={SUB}>shares</T>
      <path d="M50,30 L50,50 L100,50 L100,80 L160,80 L160,110 L230,110 L230,140 L320,140" className="fill-none stroke-up" strokeWidth={2.25} />
      <path d="M50,160 L120,160 L120,130 L170,130 L170,100 L230,100 L230,70 L280,70 L280,40 L320,40" className="fill-none stroke-down" strokeWidth={2.25} />
      <circle cx={210} cy={105} r={6} className="fill-accent" />
      <line x1={40} x2={210} y1={105} y2={105} className="stroke-accent" strokeDasharray="4 3" />
      <T x={46} y={98} a="start" size={11} cls="fill-accent-strong" weight={600}>auction price</T>
      <T x={326} y={136} a="start" size={10} cls="fill-up">buy</T>
      <T x={326} y={44} a="start" size={10} cls="fill-down">sell</T>
      <T x={250} y={168} size={10} cls={SUB}>most shares matched here</T>
    </Frame>
  );
}

// ── L7. Best bid and offer across venues ────────────────────────────────────

export function FigNbbo({ title, caption }: FigProps) {
  const id = "ms-fig-nbbo";
  const rows = [{ n: "Venue A", b: 70, a: 290 }, { n: "Venue B", b: 110, a: 300 }, { n: "Venue C", b: 90, a: 250 }];
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="Three venues each show their own best bid and best ask. The highest bid across all of them and the lowest ask across all of them, here from different venues, make up the best quote across the market. In the US this is called the NBBO.">
      {rows.map((r, i) => (
        <g key={r.n}>
          <T x={20} y={34 + i * 34} a="start" size={11}>{r.n}</T>
          <line x1={r.b + 60} x2={r.a} y1={30 + i * 34} y2={30 + i * 34} className="stroke-line-strong" strokeWidth={1.5} />
          <circle cx={r.b + 60} cy={30 + i * 34} r={6} className={i === 1 ? "fill-up" : "fill-up opacity-40"} />
          <circle cx={r.a} cy={30 + i * 34} r={6} className={i === 2 ? "fill-down" : "fill-down opacity-40"} />
        </g>
      ))}
      <line x1={170} x2={170} y1={46} y2={146} className="stroke-up" strokeDasharray="3 3" />
      <line x1={250} x2={250} y1={114} y2={146} className="stroke-down" strokeDasharray="3 3" />
      <T x={20} y={160} a="start" size={11} weight={600}>Best across venues</T>
      <line x1={170} x2={250} y1={156} y2={156} className="stroke-accent" strokeWidth={3} />
      <circle cx={170} cy={156} r={6} className="fill-up" /><circle cx={250} cy={156} r={6} className="fill-down" />
      <T x={170} y={180} size={10} cls="fill-up">highest bid (B)</T>
      <T x={260} y={180} size={10} cls="fill-down">lowest ask (C)</T>
      <T x={340} y={196} a="end" size={10} cls={SUB}>US name: NBBO</T>
    </Frame>
  );
}

// ── L8. Dark pool ───────────────────────────────────────────────────────────

export function FigDark({ title, caption }: FigProps) {
  const id = "ms-fig-dark";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="Left: a lit order book that everyone can see, with a bid, an ask and the mid between them. Right: a dark pool, a box whose orders nobody can see. A buyer and a seller inside it are matched at the lit market's mid price.">
      <T x={90} y={18} weight={600}>Lit book</T>
      <rect x={40} y={30} width={100} height={20} className="fill-down" opacity={0.5} />
      <rect x={40} y={56} width={100} height={20} className="fill-down" opacity={0.3} />
      <rect x={40} y={96} width={100} height={20} className="fill-up" opacity={0.5} />
      <rect x={40} y={122} width={100} height={20} className="fill-up" opacity={0.3} />
      <line x1={30} x2={210} y1={86} y2={86} className="stroke-accent" strokeWidth={1.5} strokeDasharray="5 3" />
      <T x={30} y={82} a="start" size={10} cls="fill-accent-strong">mid</T>
      <Box x={210} y={30} w={130} h={112} cls="fill-fg stroke-fg" r={10} />
      <T x={275} y={24} weight={600}>Dark pool</T>
      <circle cx={245} cy={86} r={10} className="fill-up" />
      <circle cx={305} cy={86} r={10} className="fill-down" />
      <line x1={255} x2={295} y1={86} y2={86} className="stroke-canvas" strokeWidth={2} />
      <T x={275} y={120} size={10} cls="fill-canvas">match at the mid</T>
      <T x={275} y={62} size={10} cls="fill-canvas">orders hidden</T>
      <T x={180} y={168} size={10} cls={SUB}>the dark price comes from the lit market</T>
    </Frame>
  );
}

// ── L9. A latency race ──────────────────────────────────────────────────────

export function FigLatency({ title, caption }: FigProps) {
  const id = "ms-fig-latency";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A time line. News changes the value at the first mark. The firm quoting sends a cancel for its now-stale quote; a faster firm sends an order to trade against it. The faster order arrives first, so the stale quote is picked off before the cancel lands.">
      <line x1={30} x2={340} y1={40} y2={40} className="stroke-line-strong" strokeWidth={1.5} />
      <T x={340} y={30} a="end" size={10} cls={SUB}>time →</T>
      <line x1={60} x2={60} y1={32} y2={48} className="stroke-warn" strokeWidth={2} /><T x={60} y={24} size={11} cls="fill-warn" weight={600}>News</T>
      <T x={20} y={84} a="start" size={11}>Quoting firm: cancel</T>
      <Arrow id={id} x1={60} y1={96} x2={290} y2={96} cls="stroke-fg-muted" dash="5 3" />
      <T x={292} y={110} a="end" size={10} cls={SUB}>cancel arrives</T>
      <T x={20} y={136} a="start" size={11} cls="fill-down">Faster firm: trade</T>
      <Arrow id={id} x1={60} y1={148} x2={210} y2={148} cls="stroke-down" />
      <T x={212} y={162} a="end" size={10} cls="fill-down">order arrives first</T>
      <line x1={210} x2={210} y1={48} y2={150} className="stroke-down" strokeDasharray="2 3" />
      <T x={214} y={64} a="start" size={11} weight={600}>stale quote</T>
      <T x={214} y={78} a="start" size={11} weight={600}>picked off</T>
    </Frame>
  );
}

// ── L10. How a retail order is routed ───────────────────────────────────────

export function FigRetailRoute({ title, caption }: FigProps) {
  const id = "ms-fig-retail-route";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="Your order goes to your broker. The broker may send it to a wholesaler, which fills it itself, often slightly better than the quote, and may pay the broker for the order flow. Or the broker sends it to an exchange, where it trades against the order book.">
      <Box x={10} y={74} w={60} h={34} /><T x={40} y={95} size={11}>You</T>
      <Arrow id={id} x1={70} y1={91} x2={118} y2={91} />
      <Box x={120} y={74} w={70} h={34} /><T x={155} y={95} size={11}>Broker</T>
      <Arrow id={id} x1={190} y1={84} x2={248} y2={44} />
      <Arrow id={id} x1={190} y1={98} x2={248} y2={140} />
      <Box x={250} y={22} w={100} h={38} cls="fill-accent-soft stroke-accent" /><T x={300} y={39} size={11}>Wholesaler</T><T x={300} y={53} size={9} cls={SUB}>fills it itself</T>
      <Box x={250} y={124} w={100} h={38} /><T x={300} y={141} size={11}>Exchange</T><T x={300} y={155} size={9} cls={SUB}>order book</T>
      <Arrow id={id} x1={250} y1={56} x2={180} y2={72} cls="stroke-warn" dash="4 3" />
      <T x={196} y={36} size={9} cls="fill-warn">payment for</T>
      <T x={196} y={48} size={9} cls="fill-warn">order flow</T>
      <T x={300} y={78} size={9} cls="fill-accent-strong">often a little better</T>
      <T x={300} y={90} size={9} cls="fill-accent-strong">than the quote</T>
      <T x={180} y={184} size={10} cls={SUB}>the route depends on the broker; ask yours</T>
    </Frame>
  );
}

// ── L11. LULD bands and a pause ─────────────────────────────────────────────

export function FigLuld({ title, caption }: FigProps) {
  const id = "ms-fig-luld";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="A reference price line with an upper band above it and a lower band below it. Price falls and reaches the lower band. It stays there, which is the limit state; after 15 seconds trading pauses for five minutes, then reopens with an auction.">
      <path d="M20,60 C80,58 120,62 170,64 S260,70 330,68" className="fill-none stroke-accent" strokeWidth={1.5} strokeDasharray="5 3" />
      <path d="M20,30 C80,28 120,32 170,34 S260,40 330,38" className="fill-none stroke-up" strokeWidth={1.5} />
      <path d="M20,90 C80,88 120,92 170,94 S260,100 330,98" className="fill-none stroke-down" strokeWidth={1.5} />
      <T x={334} y={42} a="start" size={9} cls="fill-up">upper</T>
      <T x={334} y={72} a="start" size={9} cls="fill-accent-strong">ref</T>
      <T x={334} y={102} a="start" size={9} cls="fill-down">lower</T>
      <path d="M20,62 L60,58 L90,70 L120,80 L150,93 L175,94" className="fill-none stroke-fg" strokeWidth={2.25} />
      <rect x={150} y={84} width={25} height={18} className="fill-warn" opacity={0.3} />
      <T x={162} y={124} size={10} cls="fill-warn">limit state</T>
      <T x={162} y={136} size={10} cls="fill-warn">(15 s)</T>
      <rect x={180} y={20} width={90} height={110} className="fill-fg-subtle" opacity={0.18} />
      <T x={225} y={80} size={11} weight={600}>5-minute</T>
      <T x={225} y={94} size={11} weight={600}>pause</T>
      <T x={300} y={150} size={10} cls={SUB}>reopens with an auction</T>
      <T x={20} y={180} a="start" size={10} cls={SUB}>US single-stock rule (Limit Up-Limit Down)</T>
    </Frame>
  );
}
