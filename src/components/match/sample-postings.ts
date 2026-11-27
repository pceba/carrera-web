/**
 * Fictional postings for `/dev/encaje`, used only when the database has none (no Supabase locally).
 * They exist so the page and its e2e test have something to rank; they are never shown in
 * production.
 */
import type { Posting } from "@/lib/postings/types";

const base = {
  source: "greenhouse" as const,
  source_url: "https://example.com/oferta",
  first_seen_at: "2026-11-01T00:00:00Z",
  posted_at: "2026-11-10T00:00:00Z",
  remote: false,
  level: "analyst" as const,
};

export const SAMPLE_POSTINGS: Posting[] = [
  {
    ...base,
    id: "s1",
    external_id: "s1",
    company: "Empresa Ejemplo",
    title: "Junior Data Analyst (SQL, Python)",
    location: "Madrid",
    city: "Madrid",
    industry: "data-science",
  },
  {
    ...base,
    id: "s2",
    external_id: "s2",
    company: "Consultora Ficticia",
    title: "Business Analyst",
    location: "Barcelona",
    city: "Barcelona",
    industry: "consulting",
  },
  {
    ...base,
    id: "s3",
    external_id: "s3",
    company: "Bufete Imaginario",
    title: "Paralegal",
    location: "Madrid",
    city: "Madrid",
    industry: "big-law",
  },
  {
    ...base,
    id: "s4",
    external_id: "s4",
    company: "Laboratorio IA",
    title: "Machine Learning Intern",
    location: "Remote - EMEA",
    city: null,
    remote: true,
    level: "intern",
    industry: "ai",
  },
  {
    ...base,
    id: "s5",
    external_id: "s5",
    company: "Banca Inventada",
    title: "Investment Banking Analyst",
    location: "Madrid",
    city: "Madrid",
    industry: "investment-banking",
  },
];
