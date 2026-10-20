# GA Affiliated — World Top 100 · 2026 and All-Time

## Scope
This is a **GA-curated, independent, source-driven leaderboard**, not an official World Athletics world ranking. It supports girls/boys, ages 7–18, 2026 season and all-time, country filters and a broad events catalog. It **does not claim worldwide completeness** and is intentionally empty until authorized, checked data is added. The previously published `rankings-data.csv` (Florida meet sample) is preserved unchanged and is not automatically promoted to world-ranking data.

## How to install
1. Use the **UPDATE_ONLY** ZIP and extract it.
2. On `GAAFFILIATED/gaaffiliated.github.io`, GitHub → Code → Add file → Upload files.
3. Select the **files inside** the ZIP folder (not the folder or ZIP), so `track-top-100.html`, `world-rankings.js`, `world-rankings.css`, `world-events.json` and `world-rankings-data.csv` appear at the same root level as `index.html`.
4. Commit to `main`, wait for the GitHub Pages deploy, visit `https://www.gaaffiliated.com/track-top-100.html`.
5. Keep `CNAME`, `assets/`, `ga-loader.*`, `rankings-data.csv`, products, and ambassador pages intact.

## Import pipeline
1. Obtain written source redistribution rights or data licensing, or obtain directly submitted results with permission to display; preserve attribution. Check the agreement for commercial use (GA is an apparel business), caching and republication.
2. Confirm meet validity, athlete category and birth year **privately** (do not publish full birth dates), sex category as listed in official result, date, event, exact hurdle height / implement weight, timing method, wind, and surface.
3. Export to `world-rankings-data.csv`, UTF-8 CSV with header listed in that file. Each field listed below is required unless marked optional.
4. Only release reviewed records with `permission_status=approved` / `licensed` / `owned`, `age_verified=yes`, `record_status=verified`. These flags are internal publication **attestations** made by GA staff, not proof of validation by the website itself.
5. Run `python3 validate_world_rankings.py world-rankings-data.csv` (no third-party dependencies). Fix every reported error before publication. Commit the CSV; reload the page. No API keys, secret tokens or birthdates should ever enter the public repository.
6. Audit missing national federations and events. Display a detailed per-category coverage report before treating results as representative.

## CSV fields
`record_id,athlete_id,athlete,gender,country,age,event,event_spec,venue_type,mark,wind,timing,meet,date,team,source_name,source_url,permission_status,age_verified,record_status,notes`

- `record_id`: unique key for this particular meet performance; e.g., `GA-2026-USA-0001`.
- `athlete_id`: consistent publisher/permitted canonical ID across meets if available. For relay rows this is a **team/squad ID** and is required. Do not use personal government/school IDs.
- `athlete`: athlete/relay team name as published, with appropriate permission.
- `gender`: `Girls` or `Boys` (match the meet result division).
- `country`: upper-case ISO 3166-1 alpha-2 or alpha-3 (e.g. `USA`, `JAM`, `KEN`, `GBR`), consistent across records.
- `age`: athlete's **calendar-year age on Dec 31 of the performance year** = result year minus confirmed birth year. Example: an athlete born in 2014 with a 2026 mark is listed as 12 regardless of birthday date. This follows one internally consistent comparison convention; it does not replace sanctioning bodies' age divisions.
- `event`: exact name from `world-events.json`.
- `event_spec`: `Standard` for ordinary races/jumps; use `76.2 cm`, `30 in`, `2 kg`, `600 g`, `3 kg`, `U18 specification`, etc., with a canonical specification ID **and the same units/wording for identical hardware**. Required for hurdles, throws, certain relays/combined events.
- `venue_type`: `Outdoor`, `Indoor`, `Road`, `Cross Country`. Different venues cannot share a ranking unless selected explicitly.
- `mark`: elapsed seconds `12.30`, or `2:33.45`, or `1:04:30.22`; field measurements **in meters** `5.45`; combined events **integer points** `3092`.
- `wind`: actual wind in m/s for outdoor 100m/200m/specified hurdles/horizontal jumps; write `+1.2`, `-2.1`; leave empty only if unknown. Wind-legal view excludes unknown values for wind-regulated outdoor events.
- `timing`: `FAT`, `Hand`, `Transponder`, `Not Applicable`. For sprint rankings, publish FAT separately from hand times; confirm meet timing quality before accepting.
- `meet`: actual event name, `date`: `YYYY-MM-DD`; `team` optional; `source_name` + HTTPS `source_url`: official published results.
- `permission_status`: `approved`, `licensed`, or `owned` **only after permission has been checked**; `age_verified=yes` only after age checked offline; `record_status=verified` only after event and result verified against source.
- `notes`: optional provenance or editorial notes; do not include health information, DOBs, contact details, or private identifiers.

## Publication and ranking logic
- A record must have a valid published HTTPS result link, provenance, rights approval, internal age check and internal verification.
- Eligible 2026 board: performance date within January 1–December 31, 2026. All-time board: any imported year (historical years aren't excluded), but must be an age-appropriate mark from that year.
- Rank exact age, gender, event, apparatus specification, venue type and selected region; choose each athlete's best eligible result in that bucket. Fastest times first; longest/highest field marks and most combined points first. Ties share a rank. Display up to **100 athletes**, not 100 repeated race rows.
- Country filter shows top 100 *within* the selected country, and is not a subset of world ranks.
- If multiple specifications or venue types are in the same selection, page asks the visitor to select one to avoid misleading combined tables.
- Default wind filter excludes all outdoor marks with wind above +2.0 m/s **or missing wind** for regulated sprint and horizontal-jump events. Turning this filter off makes their data visible, but they cannot be called wind-legal records.
- Avoid including hand-timed short sprints alongside FAT unless a clearly separated manual-time ranking is introduced; initial validation supports timing labels but the page currently shows them together if uploaded. Therefore **GA editorial policy must accept FAT only for short sprint/hurdle data**, and only use the admin validator plus review in the meantime.

## Data sources / coverage plan
Priority 1: World Athletics results and top lists for older youth; written permission/license before republishing bulk lists. World Athletics age groups are U18 and U20, **not single-year ages 7–18**, and its *World Rankings* are point-based rather than raw-time-only. Carefully verify any online filter before collecting anything.

Priority 2: Direct member-federation results (e.g., USATF, Athletics Canada, Jamaica Athletics Administrative Association, Athletics Kenya, UK Athletics / England Athletics, Athletics Australia, Athletics South Africa) with approved permissions, meet records and local age group conversions.

Priority 3: MileSplit, AthleticNET, licensed international youth results partners and meet timers (FinishLynx, timing providers) **only where data redistribution is permitted**. Do not scrape paywalled rankings or assume public browsing grants copying rights. Note the old MileSplit developer API documentation contains explicit data storage/scraping limitations; treat it as historical and obtain current terms directly from MileSplit.

Phase 1: Identify and license 5–10 sources covering multiple countries and all age ranges, define a legal use contract and audit source coverage. Phase 2: import 2026 eligible results (sprint/distance first). Phase 3: add throws, hurdles by exact specs, and relays. Phase 4: historic archive with event-era and equipment reviews. Phase 5: automate updates via licensed API, permitted exports or staff imports using build workflows, not JavaScript scraping users' browsers.

## Reliability / privacy
- Pages are served from GitHub Pages, which is a static host: no direct live connection to MileSplit or World Athletics. Editing the CSV + committing is how the board changes; or use a separate secure data-service integration approved by the data provider.
- Check regional variations in age assignment (meet-day age vs December 31 age vs competition-year U18), timing precision, winds, implement weight, hurdle heights, short-track/indoor/outdoor; do not extrapolate unverified ages.
- Youth privacy: do not publish full birth dates, contact details or unnecessary personal identifiers. Have a documented corrections/removals policy and appropriate permissions.
- Before any paid use, consult data source legal terms and consult the business owner for authorized republication. GA should not claim endorsement by World Athletics or MileSplit.

### References
- World Athletics top lists: https://worldathletics.org/records/toplists
- World Athletics all-time top lists: https://worldathletics.org/records/all-time-toplists
- World Athletics age classes and 2026 rules: https://worldathletics.org/about-iaaf/documents/book-of-rules
- World Athletics World Rankings basics: https://worldathletics.org/world-ranking-rules/basics
- MileSplit legacy API terms (historical, not necessarily current): https://milesplit.wordpress.com/about/getting-started/
