# Folder ownership

Each folder has exactly one owning stream. A session edits only its own folders.

| Folder                                                                                                                        | Owner                                           | Milestone |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------- |
| `src/components/ui/`                                                                                                          | WS-A Design system + shell                      | M1        |
| `src/components/nav/`, `content/catalog.ts`                                                                                   | WS-A Design system + shell                      | M1        |
| `src/app/(public)/preparacion/`, `src/app/(public)/recursos/`                                                                 | WS-A Design system + shell                      | M1        |
| `src/components/industries/consulting/`                                                                                       | WS-B Consulting                                 | M1        |
| `src/app/(public)/industrias/`                                                                                                | WS-A Design system + shell                      | M1        |
| `src/app/(public)/industrias/consultoria/`                                                                                    | WS-B Consulting                                 | M1        |
| `src/app/(public)/legal/`                                                                                                     | WS-D Legal/GDPR                                 | M1        |
| `src/app/(account)/`                                                                                                          | WS-C Auth + data                                | M1        |
| `src/app/api/alerts/`                                                                                                         | WS-F Alerts                                     | M2        |
| `src/lib/supabase/`                                                                                                           | WS-C Auth + data                                | M1        |
| `supabase/`                                                                                                                   | WS-C Auth + data                                | M1        |
| `content/industrias/consultoria/`                                                                                             | WS-B Consulting                                 | M1        |
| `content/legal/`                                                                                                              | WS-D Legal/GDPR                                 | M1        |
| `src/app/(public)/ofertas/`                                                                                                   | WS-E Postings pipeline                          | M2        |
| `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`, `.cargo/`, `crates/`, `config/`, `src/lib/generated/`, `src/lib/postings/` | WS-R Rust core                                  | M2        |
| `emails/`                                                                                                                     | WS-F Alerts                                     | M2        |
| `.github/workflows/`                                                                                                          | WS0 Foundation (ci.yml); WS-E owns postings.yml | M0        |
| `src/styles/tokens.css`, `package.json`, repo root config, `src/app/layout.tsx`, `src/lib/site.ts`                            | WS0 Foundation (shared: tiny PR merged first)   | M0        |
| `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`                                                                    | WS-A Design system + shell                      | M1        |
| `src/middleware.ts`                                                                                                           | WS-C Auth + data                                | M1        |
