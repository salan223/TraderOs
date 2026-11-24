# Lesson style guide

For anyone writing a new track in `lib/academy/content/*.ts`. The renderers
(`components/academy/blocks.tsx`, `lesson-format.tsx`) do the styling; your job
is to pick the right block and keep text short.

## The two rules

1. **No paragraph longer than ~4 lines** (about 230 characters). Split it, or
   turn it into one of the blocks below. The renderer also splits long
   paragraphs at sentence ends, but write short ones yourself.
2. **Illustrate every core concept.** A static illustration first, then the
   live widget. A beginner should be able to understand the idea from the
   picture and its caption alone.

## Type scale (`app/globals.css`)

Use these utilities, never ad-hoc sizes like `text-[13px]`, in lesson rendering.

| Utility | Use | Size |
|---|---|---|
| `t-heading` | Section heading | 20px / 1.3, semibold |
| `t-subheading` | Card, row and callout titles | 16px / 1.45, semibold |
| `t-body` | All reading text: paragraphs, lists, cards, callouts | 16px / 1.7, `fg-body`, max 70ch |
| `t-small` | Captions, metadata, footnotes | 14px / 1.55, muted |
| `t-label` | Eyebrows and part labels ("C · Beginner explanation", "Formation") | 11px uppercase |

Body text is the same size everywhere. Only captions are smaller.

## Inline markup (any text field)

- `[[term-id]]` or `[[term-id|shown text]]`: glossary tooltip.
- `**text**`: highlight a key term or number. Use 1–2 per paragraph at most.
- A paragraph or list item that starts `Short label: explanation` (label up
  to six plain words) is shown as a definition row automatically.

## Blocks

| Block | When |
|---|---|
| `p` | One idea, 1–3 sentences. |
| `list` | Parallel items. `"Open: the first trade…"` items get a bold lead. |
| `defs` | Two or more terms with short explanations (a glossary-style table). |
| `step-list` | A procedure, or a checklist the reader does in order. |
| `callout` tone `key` | The one sentence to remember ("Key idea"). |
| `callout` tone `warn` | A trap or a risk ("Watch out"). |
| `callout` tone `example` | A worked or described example. |
| `callout` tone `info` | A neutral note, optionally with a `link` to another lesson. |
| `cards` | Several items with the same fields (e.g. candle patterns: Formation / Possible reading / Failure), each with an optional illustration. |
| `deeper` | "Go deeper": optional technical detail, closed by default. Use in deep-dive sections, never for core beginner content. Keep `concept-card` and `research` at top level (tests look for them there). |
| `illustration` | A static labelled diagram (see below). Always with a caption. |
| `visual` | Older diagrams in `visuals.tsx` (market basics). |
| `interactive` | A live widget. Comes after the static illustration of the same idea. |

## Illustrations (`components/academy/illustrations.tsx`)

Static SVG, theme tokens only (`fill-up` / `fill-down` for direction,
accent to point at the thing that matters), with an accessible `aria-label`.
Each is framed with an **Illustration · Not real data** label and a caption.
Do not put invented prices on them.

Available: `candle-anatomy`, `candle-types`, `ohlc-to-candle`, the
`pattern-*` set (hammer, hanging-man, inverted-hammer, shooting-star, doji,
marubozu, pin-bar, engulfing, harami, inside-bar, outside-bar, morning-star,
three-soldiers), `timeframe-aggregation`, `swing-structure`, `trend-vs-range`,
`support-resistance`, `linear-vs-log`, `gaps`, `gap-stop`.

To add one: add its id to `IllustrationId` in `lib/academy/types.ts` and a
component to `ART`. Candle diagrams are a few lines with `<Candles data=[cd(o,h,l,c)]>`,
which scales prices into the box; pass `ctx: true` for faded context candles.

## Charts

`CandleChart`, `BrickChart` and `PfChart` can be dragged, zoomed (ctrl/cmd +
wheel, or plain wheel once focused, or pinch) and reset with a double-click.
A hint line under each chart says so. Nothing extra to do in content.

## Section checklist

- Beginner section: illustration of the core idea, short paragraphs, a `defs`
  for new terms, one `warn` or `key` callout.
- Visual section: one sentence or a `step-list` on what to do, then the widget.
- Example: short setup paragraph, then a `key` callout with the lesson.
- Deep dive: concept card, research, then `deeper` for extra detail.
