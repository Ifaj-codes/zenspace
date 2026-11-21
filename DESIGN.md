# Google Stitch Design System Specification: ZenSpace

> **Project:** ZenSpace: Unified Minimalist Productivity Web Platform  
> **Aesthetic Philosophy:** *Dieter Rams Functionalism × Tokyo Studio Stationery*  
> **Anti-Slop Directives:** Strict ban on generic AI purple gradients, floating glow orbs, emoji badges, redundant 4-card metric grids, and oversized bubbly radii.

---

## 1. Visual Identity & Design Tokens

### 1.1 Color Architecture (Monochromatic Discipline)

ZenSpace rejects decorative purple/violet AI themes in favor of an authentic, ink-and-paper monochromatic foundation with strictly utilitarian semantic accents.

#### Light Canvas (Warm Studio Paper)
- `canvas-bg`: `#fbfaf8` (Warm tactile off-white, reduces eye strain)
- `surface-base`: `#ffffff` (Crisp white elevation)
- `surface-subtle`: `#f4f3ef` (Muted container background)
- `border-hairline`: `#e5e3dc` (1px tactile divider)
- `border-strong`: `#d1cec4` (Interactive boundary)
- `text-ink-primary`: `#121316` (Deep carbon ink)
- `text-ink-secondary`: `#686b74` (Muted metadata)
- `text-ink-tertiary`: `#9ea0a8` (Placeholders & timestamps)

#### Dark Canvas (Monolithic Basalt)
- `canvas-bg`: `#0d0e11` (Deep matte basalt black)
- `surface-base`: `#131519` (Elevated surface)
- `surface-subtle`: `#1a1c22` (Container background)
- `border-hairline`: `#23262d` (Subtle 1px separator)
- `border-strong`: `#323640` (Interactive focus state)
- `text-ink-primary`: `#f2f2f4` (Crisp bone white)
- `text-ink-secondary`: `#8c909b` (Subdued metadata)
- `text-ink-tertiary`: `#565962` (Subtle timestamps)

#### Utilitarian Semantic Accents (Purpose-Driven Only)
- **High Priority / Hard Deadlines**: `#e5484d` (Vermilion Red) / Dark: `#ff6369`
- **Lectures / Coursework**: `#2563eb` (Cobalt Ink) / Dark: `#60a5fa`
- **Lab Sessionals / Experiments**: `#059669` (Pine Forest) / Dark: `#34d399`
- **Midterms & Final Exams**: `#d97706` (Burnt Ochre) / Dark: `#fbbf24`
- **Assignments / Submissions**: `#7c3aed` (Deep Violet) / Dark: `#a78bfa`
- **Personal / Wellbeing**: `#64748b` (Slate Neutral) / Dark: `#94a3b8`

---

## 2. Typography & Spatial Rhythm

### 2.1 Typographic Hierarchy
- **Font Stack**: `Plus Jakarta Sans`, `Inter`, `-apple-system`, `sans-serif`
- **Monospace Tabular Stack**: `JetBrains Mono`, `ui-monospace`, `monospace` (Used for dates, timestamps, room codes, student IDs, and counters)
- **Scale**:
  - `Display / Hero`: `24px - 28px`, Weight 700, Tracking `-0.035em`, Line Height `1.15`
  - `Section Header`: `14px - 16px`, Weight 600, Tracking `-0.02em`
  - `Body / Task Title`: `13px - 14px`, Weight 500, Tracking `-0.01em`
  - `Micro Labels / Meta`: `11px - 12px`, Weight 500, Tracking `0.01em`
  - `Code / Room / ID`: `11px`, Weight 500, Monospace with `tabular-nums`

### 2.2 Geometry & Border Radii
- **Containers & Panels**: `rounded-xl` (`10px - 12px`)
- **Interactive Buttons & Inputs**: `rounded-md` (`6px - 8px`)
- **Tags & Priority Markers**: `rounded` (`4px`) with 1px border. Never circular 9999px bubble pills.

---

## 3. Human-Crafted Layout Blueprint

1. **Editorial Studio Header**:
   - Minimalist wordmark with academic metadata: `ZenSpace // CSE 324 • BAIUST • Nesar Uddin Ifag (1119004)`.
   - Subtle segmented navigation (Workspace, Timetable, Task Backlog, Notebook).
   - Quick Command Trigger (`+ New Item`, Theme Toggle, Reseed).

2. **Synchronized Command Ribbon**:
   - Replaces generic 4-box card row with an **interactive daily focus bar**:
     - Date strip showing current week with active class indicators.
     - Urgent deadline alert banner with direct 1-click completion.
     - Real progress telemetry in compact monospace format (`[3/5 DONE • 60%]`).

3. **Interconnected Studio Workstation**:
   - **Calendar Section**: Real monthly hairline grid with color bars on the left edge of events (architectural blueprint style), showing task deadlines as high-contrast deadline markers.
   - **Task Backlog**: Grouped by urgency with clear editorial dividers. One-click instant strike-through, inline fast capture bar.
   - **Notebook Section**: Monospace-accented markdown editor with clean typography, tag pill filters, and pinned card highlights.
