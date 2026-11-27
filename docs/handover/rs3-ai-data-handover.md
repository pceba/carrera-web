# RS-3 (AI roles + data science) hand-over: research done so far, dossiers NOT yet written

Status 2026-11-27: usage limit hit. No dossier exists in the repo yet and nothing is committed.
Branch: claude/rs3-ai-data-c87ac9. Files to write: docs/research/inteligencia-artificial.md and docs/research/data-science.md (structure in docs/briefs/rs_research.md).

## Verified pay data (gross annual EUR, Spain)

- Michael Page "Estudio de Remuneración 2026", Tecnología p.64 (hosted copy: eiposgrados.com/wp-content/uploads/2026/06/Estudio-de-Remuneracion-2026-Michael-Page-Spain.pdf; primary should be michaelpage.es). Columns 1-3 / 4-7 / 8+ years:
  - Data Analyst 30-45K / 45-65K / 65-85K
  - Data Engineer 35-50K / 50-65K / 65-90K
  - Data Scientist 35-50K / 50-70K / 70-90K
  - Data Architect 55-70K / 70-90K / 90-110K (bonus 10%)
  - ML Specialist 50-60K / 65-90K / n.a.
  - Investigador IA 45-55K / 55-70K / n.a.
  - Computer Vision 30-40K / 40-70K; Deep Learning 42-65K / 65-90K / 90-130K
  - IA Engineer 40-60K / 60-75K
  - (Use pdftotext -raw; -layout scrambles the labels.)
- LHH Guía Salarial 2026 p.46 (lhh.com/es-es/guia-salarial), >3 / >5 / >10 years, multinational vs pyme:
  - Data Science 50K / 60K / 80K (multinational, +10% variable); pyme 45K / 55K / 65K
  - IA Engineer 55K / 75K / 90K (multinational); pyme 50K / 60K / 80K
  - Business Analyst 40K / 55K / 65K; Data Engineer 48K / 60K / 90K
- Adecco/LHH tech guide EMEA 2026: Madrid and Barcelona run 5-10% above national ranges.
- Hays 2026: IT salaries +6% (secondary, via CIO.com). Michael Page: average +3.5% in 2026 (via Forbes.es).
- Funcas (Apr 2026) "Inteligencia artificial y mercado de trabajo en España", citing PwC AI Jobs Barometer 2025: AI-skill postings in Spain rose from ~5,000 (2018) to 39,000 (2024); global AI wage premium 56% (PwC 2026 global: 62%, via search summary).
- BLS (US, for context): data scientist median $120,230 in May 2025, +34.6% projected 2025-35.
- PwC Spain PDF returned Access Denied to curl; open it in a browser.

## Verified employer facts

- BBVA: Be Talent (6th edition; 23 hires; 700+ applicants; 53 finalists; in-person datathon on card-fraud model; teams in Madrid, Bilbao, AI Factory). 1,000+ data scientists in the Analytics Transformation unit (created end 2024). Exact article dates are not shown on the pages. Careers: bbva.com/en/careers.
- Santander: Retail Graduate Program (12 months, Engineering/CS/Data/AI; applications open March 2027 for Spain). Data Science Talent Program (rotations; date TBD). careers.santander.com redirects to santander.com/en/careers.
- CaixaBank: caixabankcareers.com. Paid internships (min. 6 months, call until 20 Nov 2026, Feb-Jul 2027), Data Talent Program (closed at the time).
- Multiverse Computing: Madrid office opened 18 Dec 2025 (Castellana 200, 60+ staff); HQ San Sebastián; Barcelona and Zaragoza offices exist. Series C $570M reported July 2026 (secondary). Careers URL /careers returns 404: find the right URL.
- McKinsey QuantumBlack lists Madrid roles (data scientist, AI engineer, forward deployed engineer, intern) on mckinsey.com/careers/search-jobs.
- Amazon: Madrid Technical Hub and Barcelona (applied scientist roles); amazon.jobs/content/en/locations/spain/madrid. Barcelona ML R&D centre announced 2017 (Amazon press release).
- ELLIS units in Alicante, Barcelona, Madrid (no Valencia unit confirmed). ELLIS PhD 2026 call: deadline 31 Oct 2026, interviews Jan-Feb 2027.
- BSC International Summer HPC Internship: 2026 call closed 1 Apr 2026, ~1,166.67 EUR/month gross.
- Google 2027 internship windows (EMEA) closed Oct-Nov 2026; research roles are in the UK, Switzerland, France, Germany (search summary, reported).
- Telefónica: jobs.telefonica.com, Telefónica Research Barcelona, OICampus; older intern calls date from 2008 and 2017.
- AESIA is based in A Coruña (La Moncloa press release, Feb 2025). AI Act dates: artificialintelligenceact.eu/implementation-timeline. The "Digital Omnibus" delay is UNVERIFIED, so check the Official Journal.
- Unverified: a LinkedIn-only claim that Anthropic opened a Madrid office. Check anthropic.com.

## Degrees (Spain)

UC3M Grado en IA (starts Sept 2025, 240 ECTS, English and Spanish), UNED Ingeniería en IA, UA Ingeniería en IA, UCM Ingeniería de Datos e IA, UPM Ciencia de Datos e IA, IE Computación e IA, UEM, Deusto.

## URL status (curl, 2026-11-27)

- 200: Anthropic, OpenAI, DeepMind, Mistral, Hugging Face (apply.workable.com/huggingface), DeepL, Telefónica, Indra (careers.indragroup.com), Minsait, Accenture, Deloitte, BCG, Microsoft, NVIDIA, IBM, Oracle, Glovo (careers.glovoapp.com), Typeform, Clarity AI, Sherpa.ai, Eurecat, Vodafone ES, Mapfre (jobs.mapfre.com), Capgemini (/es-es/talento/trabaja-en-capgemini/), Endesa (/en/talent/work-with-us/scholarships), Repsol (/en/careers/...), BSC (/join-us), ELLIS Alicante (/en/jobs/).
- Bot-blocked (403, site exists): Iberdrola, El Corte Inglés, Inditex (redirects to inditexpeople.com), Idealista, Jobandtalent, Mercadona, Iberia, Sabadell.
- 429 or 421 (exists): Cabify, Helsing, Amadeus.
- Wrong URL or timeout (find the correct one): Multiverse /careers (404), NTT Data, MasOrange (503), Wallapop, Vicomtech, OICampus (use jobs.telefonica.com), Naturgy (bot wall), McKinsey (timeout).
- Resource URLs that returned 200: Karpathy Zero to Hero, fast.ai, HF LLM course, CS229/CS224N/CS231n, d2l.ai, Google ML Crash Course, Kaggle Learn, DeepLearning.AI ML specialization, Huyen ML interviews book, ISLP, deeplearningbook, Latent Space, The Batch, Import AI, Lilian Weng, HF papers, Eugene Yan, FSDL, Made With ML, MLOps Zoomcamp, DataTalks.Club, artificialintelligenceact.eu, alia.gob.es, aprendemachinelearning.com, HackUPC, 3Blue1Brown, StatQuest, Raschka, Alammar, MIT 6.S191, Claude cookbooks, SQLBolt, DataLemur, StrataScratch, Google Data Analytics cert, McKinney book, R4DS, experimentguide.com, Storytelling with Data, dbt analytics-engineering post, Power BI learn, Tableau Public, Seeing Theory, OpenIntro, Data Skeptic, Linear Digressions, Data Elixir, datanalytics.com, SQL Murder Mystery, Ace the DS Interview, Big Data Spain, PyData Madrid/Barcelona meetups, PyConES 2026 (Barcelona, 6-8 Nov 2026, sold out).
- Redirects: Mode SQL tutorial now lives at thoughtspot.com/sql-tutorial; paperswithcode.com redirects to huggingface.co/papers/trending.
- Cajamar UniversityHack (cajamardatalab.com) could not be opened. It exists per UCM, UPV and Afi sources, and the 2022 edition had 24 universities.

## Role-definition sources found

- dbt Labs: analytics-engineer vs analyst vs data engineer (getdbt.com/blog/analytics-engineer-vs-data-analyst-vs-data-engineer), a commercial source. IBM: data engineer vs data scientist vs analytics engineer.
- swyx, "The Rise of the AI Engineer" (latent.space/p/ai-engineer, 2023).
- McKinsey explainer on forward-deployed engineers (returned 403: read it in a browser). Palantir origin is reported by secondary sources.
- Chip Huyen, ML Interviews Book (free). Beware a different O'Reilly book with a similar title by Susan Shu Chang.
- Meta DS interview structure comes only from third-party guides (Exponent, Glassdoor): flag as unverified.

## Still to research

Spanish university AI and data clubs (none verified), real interview formats at Spanish employers, recruiting calendar for Telefónica, Indra, Accenture and Inditex, a London/Zurich pay source for AI, the AI product manager role definition, and the correct URLs listed above.

## Tool notes

- Helper script to turn pages into text: scratchpad/tools/get.py (scratchpad is temporary).
- WebSearch returns summaries only: read primary pages before citing.
- The context-mode fetch tool indexes raw PDF bytes, so use curl and pdftotext -raw instead.
