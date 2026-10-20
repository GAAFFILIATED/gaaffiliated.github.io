GA AFFILIATED — TOP 100 TRACK & FIELD RANKINGS
================================================

NEW PAGE: track-top-100.html
URL AFTER GITHUB UPLOAD: https://www.gaaffiliated.com/track-top-100.html

HOW TO UPDATE
1. Download and EXTRACT the ZIP on your computer.
2. Open https://github.com/GAAFFILIATED/gaaffiliated.github.io
3. Choose Add file -> Upload files. Upload the extracted files (not the ZIP) to the ROOT of the repo. Preserve assets/ hierarchy.
4. Commit changes and wait for the GitHub Pages deployment to finish.
5. Do not replace/remove CNAME or change GoDaddy DNS. The update-only ZIP excludes CNAME.

RANKINGS DATA IS NOT YET POPULATED.
Do NOT advertise the tables as official national Top 100 until you have comprehensive verified data.
The page is a GA-curated ranking within the file's verified rows only.

FILE: rankings-data.csv
Columns: athlete,athlete_id,gender,age,event,mark,meet,date,state,team,source_url,status,wind
- athlete: athlete name, or relay team name for a relay (required)
- athlete_id: unique ID to distinguish athletes with the same name (optional but recommended)
- gender: Boys or Girls (required)
- age: individual competition age 7 through 18 (required); do not enter an age group like 11-12
- event: match an event exactly from the selector, e.g. 100m, Long Jump, Shot Put, 4x100m Relay (required)
- mark: running events in seconds or mm:ss.xx (12.45, 2:35.20); field events in METERS (4.70m), combined events in points (required)
- meet: official meet name
- date: YYYY-MM-DD (required); used to derive season
- state: two-letter code, e.g. FL
- team: team or club name
- source_url: HTTPS URL to publicly available official results (required)
- status: set to verified ONLY AFTER a human has checked the official source matches athlete, mark, event and competition age. Unverified entries are ignored.
- wind: optional, m/s, for 100m/200m short hurdles long/triple jumps. Wind-assisted marks above +2.0 are excluded if supplied.

CSV rules:
- One performance per row. The page selects each athlete's best mark for the selected event/season; best effort is only among rows in CSV.
- Times are ascending (lower is better); jumps/throws/combined points are descending.
- Ages are SINGLE ages even when the source meet uses 8U, 9–10, etc. Do not infer individual ages without a documented age.
- Unknown or unsupported events are not shown. To add another event to the selector, update the `catalog` in rankings.js.
- Use quotation marks around CSV fields with commas. Preserve the CSV header row exactly.
- Do not paste personal contact info, date of birth, addresses, or other private youth data into the public CSV.

RESULTS IMPORT/LICENSING
Import only data you have permission to reproduce. Prefer verifying published results individually and hyperlinking to the official source. This static site does not automatically fetch MileSplit, Athletic.net, AAU, or USATF datasets.

SITE PRESERVATION
All existing pages, loader assets, apparel, photo gallery, ambassadors, and CNAME are preserved in COMPLETE ZIP.
UPLOAD UPDATE ZIP to avoid unnecessarily replacing image files already online.
