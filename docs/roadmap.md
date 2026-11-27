# Roadmap, phase 2 (2026-11-27)

Owner direction for this phase:

- **Focus industries (only these six):** consulting (with strategy consulting as its own segment),
  AI roles, data science, private equity, investment banking, Big Law.
- Agents do preliminary research per industry so the content starts from quality sources.
- The site must be calmer: light silver-grey background, far less visual noise.
- Better structure and connections; easy to find your way.
- Resources must be more extensive and better distributed (not one endless page).
- No segmentation by year of degree anywhere.

## Canonical industry list

| Spanish slug (URL)        | Title on site               | Rust `Industry` value | Segments (own pages)                        |
| ------------------------- | --------------------------- | --------------------- | ------------------------------------------- |
| `consultoria`             | Consultoría                 | `consulting`          | `estrategia` (strategy), others as sections |
| `inteligencia-artificial` | Roles de IA                 | `ai`                  | decided by research                         |
| `data-science`            | Data science                | `data-science`        | decided by research                         |
| `private-equity`          | Private equity              | `private-equity`      | decided by research                         |
| `banca-de-inversion`      | Banca de inversión          | `investment-banking`  | decided by research                         |
| `big-law`                 | Big Law (grandes despachos) | `big-law`             | decided by research                         |

Everything else (tech, Big Four, marketing, startups, public sector, engineering, health) leaves the
map. Postings outside these six are not shown.

## Information architecture

```
/                         short home: what this is, the six industries, how it works
/industrias               the map: six industries, one line each, how they relate
/industrias/[slug]        industry hub: overview, segments, "start here", links to sections
/industrias/[slug]/[sec]  sections: como-funciona, el-trabajo, empresas, proceso, recursos, personas
/industrias/[slug]/[seg]  segment pages, e.g. /industrias/consultoria/estrategia
/preparacion              cross-industry prep guides: case interviews, technical interviews,
                          modelling tests, assessment centres, CV and cover letter, networking
/recursos                 resource library: filter by industry and type (book, guide, course,
                          case library, podcast, newsletter, community)
/ofertas                  postings in the six industries
/cuenta/...               account; /cuenta/encaje = CV matching (runs in the browser)
```

Every page shows where you are (breadcrumbs, section nav), what comes next (next/previous), and
related pages across industries (e.g. case interviews link consulting, PE and strategy).
Industry sections are MDX files in `content/industrias/<slug>/<section>.mdx` that can import
bespoke components from `src/components/industries/<slug>/`: one consistent frame, bespoke inside.

## Waves

**Wave 1 (parallel, now)**

- RS-1 research: consulting + strategy consulting, Big Law.
- RS-2 research: investment banking, private equity.
- RS-3 research: AI roles, data science.
- WS-IA: calm visual system, new IA and navigation, consulting migrated into it, `/preparacion`
  and `/recursos` frames, Lighthouse pass.
- WS-R2: Rust phase 2: `cw-match`, `cw-cv`, `cw-wasm`, taxonomy switched to the six industries,
  `/cuenta/encaje`.

**Wave 2 (after wave 1 merges):** one content session per industry turns its research dossier into
the industry hub, sections, resources and one interactive piece; then a review pass.
Status 2026-11-27: wave 1 merged (WS-IA, WS-R2a/b). Gemini Deep Research report received
(`docs/research/gemini-deep-research.md`); detailed plan and brief template in
`docs/briefs/wave2_plan.md` (two slices per industry, IB first).

**Wave 3:** `cw-alerts` (daily digest), BYOK practice (case feedback, CV/letter), then connect
Vercel, Supabase and secrets with Pablo.
