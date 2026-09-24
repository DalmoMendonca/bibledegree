# MDiv — Free Seminary Companion

A mobile-first companion for the **Advanced Bible Degree** curriculum. It turns the source-course spreadsheet into a Duolingo-inspired learning path with separate Dalmo/Viv progress, lecture discovery, lecture workspaces, notes, completion tracking, quizzes, and AI study guides.

## Design principles

- Teal, tactile, cheerful, high-contrast UI inspired by Duolingo's interaction language without cloning its branding.
- Mobile-first. Course content is the main event; chrome stays quiet.
- Progress is visible everywhere and stored separately for each learner in localStorage.
- No account or database required for the first version.

## Netlify

Static files publish from the repository root. Serverless functions live in `netlify/functions`.

Set this environment variable in Netlify to enable AI study guides:

- `OPENAI_API_KEY` — secret
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6-luna`

The source-course function discovers lecture sequences from supported public source pages and YouTube playlists. YouTube-caption transcripts are fetched when available and used as the grounding text for AI-generated summaries, mastery questions, reflection prompts, and quizzes.

## Local development

```bash
npx netlify dev
```
