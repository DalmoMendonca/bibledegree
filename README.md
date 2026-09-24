# Bible Degree

A personal theological learning companion for Dalmo and Viv. React + Vite, deployed to Netlify at https://mdiv.dalmo.ai. Teal learning paths, an original reading-lamb mascot, and separate learner profiles.

## Run

```sh
npm ci
npm run dev
npm run build
```

Netlify uses `netlify.toml`; the output directory is `dist`. Server functions live in `netlify/functions`. No API secret belongs in a Vite/browser environment variable.

## Content and actual coverage

The curriculum is imported from the supplied Google Sheet. This snapshot contains 62 courses and 1,938 lecture entries; 1,272 have YouTube embeds. Other indexed lessons open at their course provider. Hours are the original sheet estimates, not measured credit hours. Some rows are alternative courses.

72 Open Yale Courses lectures include published transcripts and available assignment/resource links: Hayes, Martin, and Freedman. Other providers' transcripts are linked when available; unavailable transcripts are explicitly labeled. Readings distinguish assignments from supplementary material. Videos remain with the original providers, who control availability and embedding.

One complete AI-authored **topic guide** for Reeves's first lecture is included, with six mastery prompts, four reflections, and twelve explained quiz questions. It is explicitly not a transcript-grounded summary of Reeves. Other guides are prepared on demand once the server AI credentials are configured.

### Enable live study guides

In the Netlify **mdiv** project's Environment variables, set `OPENAI_API_KEY` as a secret for Functions in production. Redeploy. Alternatively, enable Netlify AI Gateway on a supported team plan; it supplies `OPENAI_API_KEY` and `OPENAI_BASE_URL`. No credential is currently committed or included in the client bundle.

The function uses `gpt-4.1-mini`, validates the returned question structure, and caches default guides in Netlify Blobs. Transcript-based summaries and topic-only guides are labeled differently. Pasted transcripts are sent to the configured AI provider to generate a response, but are not stored in the shared guide cache. Personal reflections are never sent to AI. Generation is rate-limited; AI calls may incur provider charges. Cached and bundled guides do not require a new generation call.

Smoke test after configuration:

```sh
curl -X POST https://mdiv.dalmo.ai/api/study \
  -H 'Content-Type: application/json' \
  -d '{"lessonId":"c31-l2"}'
```

## Progress and privacy

Profiles, completion, quiz history, and notes are stored in this browser's localStorage. This is **not** authenticated cross-device sync. Settings provides JSON export/import for both profiles. Import replaces local progress. The names are convenient local profiles, not privacy/security boundaries. Course content and cached study guides are public.

The two completed Yale courses are pre-marked from the supplied history. XP starts with activity performed in this app; it is not fabricated historical activity.

## Source gaps to preserve

- Biblical Greek: the old Mounce full course is not entirely free; free introductory lectures and chapter overviews exist at the provider.
- Historical Theology II: the sheet repeats the Historical Theology I playlist. The second course is retained but unindexed, rather than duplicating the wrong lectures.
- Frame and O'Connor's old iTunes links and Shepardson's channel need a verified replacement lecture list.
- London Latin: first 100 playlist items are indexed; additional items require playlist pagination.
- BiblicalTraining lessons currently route to their verified course page where the provider's lesson selector is available. They do not pretend to contain an embedded player.

## Maintaining content

`public/data/catalog.json` contains course and lecture metadata. `public/data/lectures/{id}.json` contains source transcripts/resources. `public/data/guides/{id}.json` contains bundled guides. Imported IDs are stable and form progress keys; preserve IDs when correcting titles or links.

`scripts/import-playlists.py` and `scripts/import-yale.py` document the imports. `scripts/import-extra.py` depends on cached source HTML and should only be run after collecting those source pages. `scripts/seed-first-guide.py` reproduces the bundled guide. Python import dependencies: requests and beautifulsoup4. Source cache files are not committed.

## Attribution

Open Yale Courses material: Yale University and the credited instructors, under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/us/), except third-party materials excluded by Yale's terms. Each transcript preserves a source link and attribution. Those course materials and derivatives remain subject to their applicable license; this repository does not relicense them. See https://oyc.yale.edu/terms for the controlling terms.

Provider names, titles, and links identify their original owners. YouTube videos are embedded, not copied. This project is independent and is not affiliated with Yale, BiblicalTraining, Gordon-Conwell, Duolingo, or the other institutions. Independent learning does not award an accredited MDiv.
