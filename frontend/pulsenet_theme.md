# PulseNet — Complete UI Theme Reference

> **Stack**: React 19 · Vite 7 · TypeScript 5 · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · Recharts · Lucide-React

---

## 1. Color System

### Light Mode (`:root`)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#fcfcfc` | Page / section background |
| `--foreground` | `#171717` | Default body text |
| `--card` | `#fcfcfc` | Card surface |
| `--card-foreground` | `#171717` | Text on cards |
| `--popover` | `#fcfcfc` | Popover / dropdown surface |
| `--popover-foreground` | `#525252` | Text inside popovers |
| `--primary` | `#72e3ad` | Mint-green brand accent |
| `--primary-foreground` | `#1e2723` | Text on primary elements |
| `--secondary` | `#fdfdfd` | Off-white secondary surface |
| `--secondary-foreground` | `#171717` | Text on secondary |
| `--muted` | `#ededed` | Subtle backgrounds, dividers |
| `--muted-foreground` | `#202020` | De-emphasised text |
| `--accent` | `#ededed` | Hover highlights |
| `--accent-foreground` | `#202020` | Text on accent |
| `--destructive` | `#ca3214` | Errors / danger |
| `--destructive-foreground` | `#fffcfc` | Text on destructive |
| `--border` | `#dfdfdf` | Default borders |
| `--input` | `#f6f6f6` | Input field backgrounds |
| `--ring` | `#72e3ad` | Focus ring colour |

**Aurora palette aliases (used by the Aurora background animation):**

| CSS alias | Actual colour | Description |
|---|---|---|
| `--blue-500` | `#72e3ad` | Primary (mint green) |
| `--indigo-300` | `#4ade80` | Vibrant green |
| `--blue-300` | `#34d399` | Emerald tint |
| `--violet-200` | `#9ae9c4` | Lighter tint |
| `--blue-400` | `#22c55e` | Deeper green |

---

### Dark Mode (`.dark`)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#121212` | Near-black page bg |
| `--foreground` | `#e2e8f0` | Light body text |
| `--card` | `#171717` | Dark card surface |
| `--card-foreground` | `#e2e8f0` | Text on dark cards |
| `--popover` | `#242424` | Dark popover |
| `--popover-foreground` | `#a9a9a9` | Muted popover text |
| `--primary` | `#006239` | Deep forest green |
| `--primary-foreground` | `#dde8e3` | Text on dark primary |
| `--secondary` | `#242424` | Dark secondary surface |
| `--muted` | `#1f1f1f` | Very dark muted bg |
| `--muted-foreground` | `#a2a2a2` | Grey-out text |
| `--accent` | `#313131` | Dark hover highlight |
| `--border` | `#292929` | Dark border |
| `--input` | `#242424` | Dark input bg |
| `--ring` | `#4ade80` | Bright green focus ring |
| `--destructive` | `#541c15` | Dark destructive |

---

### Chart Palette

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | `#72e3ad` | `#4ade80` |
| `--chart-2` | `#3b82f6` | `#60a5fa` |
| `--chart-3` | `#8b5cf6` | `#a78bfa` |
| `--chart-4` | `#f59e0b` | `#fbbf24` |
| `--chart-5` | `#10b981` | `#2dd4bf` |

---

## 2. Typography

| Property | Value |
|---|---|
| **Sans font** | `Outfit, sans-serif` |
| **Serif font** | `Playfair Display` (loaded via Google Fonts, italic & weight 400–900) |
| **Mono font** | System `monospace` |
| **Base tracking** | `0.025em` (`--tracking-normal`) |

### Tracking scale (relative to `--tracking-normal`)

| Class | Offset | Result |
|---|---|---|
| `tracking-tighter` | −0.05 em | `−0.025em` |
| `tracking-tight` | −0.025 em | `0em` |
| `tracking-normal` | 0 | `0.025em` |
| `tracking-wide` | +0.025 em | `0.05em` |
| `tracking-wider` | +0.05 em | `0.075em` |
| `tracking-widest` | +0.1 em | `0.125em` |

### Usage in landing sections

| Section | Size | Weight | Font |
|---|---|---|---|
| Hero tagline | `20–32px` (clamp) | `600` | Outfit |
| Hero h1 | `3xl–6rem` (clamp) | `700` | Outfit |
| Hero h1 accent | `text-primary` | `700` | Outfit |
| Solution description | `clamp(1rem, 1.8vw, 1.15rem)` | `400` | Outfit |
| Marquee heading | `clamp(2rem, 5vw, 4rem)` | default | Outfit + Playfair italic for keyword |
| Feature list items | `text-sm` | `500` | Outfit |
| Scroll hint | `text-xs uppercase` | `600` | Outfit |

---

## 3. Border Radius

| Token | Computed |
|---|---|
| `--radius` (base) | `0.5rem` (8 px) |
| `--radius-sm` | `0.25rem` (4 px) |
| `--radius-md` | `0.375rem` (6 px) |
| `--radius-lg` | `0.5rem` (8 px) |
| `--radius-xl` | `0.625rem` (10 px) |

> Components like [GlowCard](file:///c:/Users/vivek/OneDrive/Desktop/Prayatna_3.0/src/components/ui/spotlight-card.tsx#28-168) use a hardcoded `--radius: 14` (i.e. `14px` rounded corners via inline CSS custom property) and `rounded-2xl` (`1rem`/16 px via Tailwind).

---

## 4. Shadow Scale

| Token | Value |
|---|---|
| `--shadow-2xs` | `0 1px 3px hsl(0 0% 0% / 9%)` |
| `--shadow-xs` | same as 2xs |
| `--shadow-sm` | `0 1px 3px …/17% + 0 1px 2px -1px …/17%` |
| `--shadow` | same as sm |
| `--shadow-md` | `0 1px 3px …/17% + 0 2px 4px -1px …/17%` |
| `--shadow-lg` | `0 1px 3px …/17% + 0 4px 6px -1px …/17%` |
| `--shadow-xl` | `0 1px 3px …/17% + 0 8px 10px -1px …/17%` |
| `--shadow-2xl` | `0 1px 3px hsl(0 0% 0% / 43%)` |
| `--shadow-login` | `0 20px 45px rgba(0,0,0,0.12), 0 8px 18px rgba(0,0,0,0.08)` |

---

## 5. Animations & Motion

| Name | Definition | Usage |
|---|---|---|
| `aurora` | 60 s linear infinite — pans background-position from `50%` → `350%` | Aurora hero background |
| `ping-slow` | 1.5 s cubic-bezier, scale 1→2 + opacity 1→0 | Ambulance alert ping |
| `move` | 4 s linear infinite — slide left 100%→0 + fade in/out | Ambulance icon on network lines |
| Sidebar enter | `translateX(-100%) → translateX(0)` 200 ms ease | Mobile sidebar slide-in |
| Framer Motion pages | Stagger children `0.1 s`, item fade+slide-x `0.5 s easeOut` | Solution feature list |
| Framer Motion hero | `opacity 0→1, y 32→0`, 600 ms `easeOut` | Hero tagline entrance |
| Container scroll | Scale + scroll-linked transform | Hero platform preview |

---

## 6. Component Variants

### Button

Base classes: `inline-flex rounded-lg border border-transparent text-sm font-medium transition-all`

| Variant | Background | Text | Hover |
|---|---|---|---|
| `default` | `--primary` (`#72e3ad`) | `--primary-foreground` | `/80` opacity |
| `outline` | `--background` | `--foreground` | `--muted` bg |
| `secondary` | `--secondary` | `--secondary-foreground` | `/80` opacity |
| `ghost` | transparent | inherit | `--muted` bg |
| `destructive` | `--destructive/10` | `--destructive` | `/20` opacity |
| `link` | transparent | `--primary` | underline |

| Size | Height | Padding |
|---|---|---|
| `xs` | 24 px | `px-2` |
| `sm` | 28 px | `px-2.5` |
| `default` | 32 px | `px-2.5` |
| `lg` | 36 px | `px-2.5` |
| `icon` | 32 × 32 px | — |

---

### Badge

Base: `inline-flex rounded-full border px-2 py-0.5 text-xs font-medium`

| Variant | Background | Text |
|---|---|---|
| `default` | `--primary` | `--primary-foreground` |
| `secondary` | `--secondary` | `--secondary-foreground` |
| `destructive` | `--destructive` | white |
| `outline` | transparent | `--foreground` |
| `ghost` | transparent | inherit |
| `link` | transparent | `--primary` underline |

---

### GlowCard ([spotlight-card.tsx](file:///c:/Users/vivek/OneDrive/Desktop/Prayatna_3.0/src/components/ui/spotlight-card.tsx))

| Property | Value |
|---|---|
| Border radius | `14px` (CSS var) |
| Border | 2 px solid with glow-colour hue |
| Backdrop blur | `5px` |
| Spotlight size | `250px` radial gradient |
| Default glow | `blue` (hue 220) |
| Available glows | `blue`, `purple`, `green`, `red`, `orange` |
| Current Solution card bg | `#BFE7FFcc` (~80% opacity light blue) |

---

## 7. Sidebar Tokens

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `#fcfcfc` | `#121212` |
| `--sidebar-foreground` | `#707070` | `#898989` |
| `--sidebar-primary` | `#72e3ad` | `#006239` |
| `--sidebar-border` | `#dfdfdf` | `#292929` |
| `--sidebar-ring` | `#72e3ad` | `#4ade80` |

---

## 8. Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React | 19 |
| Build | Vite | 7 |
| Language | TypeScript | 5.9 |
| CSS | Tailwind CSS | 4 |
| UI primitives | Radix UI / shadcn | — |
| Animation | Framer Motion | 12 |
| Charts | Recharts | 3 |
| Icons | Lucide-React | 0.577 |
| Notifications | Sonner | 2 |
| 3D | Three.js + R3F + Drei | 0.183 / 9 |
| Routing | React Router | 7 |

