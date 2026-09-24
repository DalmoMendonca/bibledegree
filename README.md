# Bible Degree

A free, mobile-first theological learning companion built from excellent open courses. The goal is an MDiv-scale independent-study path: serious biblical studies, languages, exegesis, theology, history, philosophy, and—over time—the practical and formational disciplines expected in a Master of Divinity curriculum.

Live site: https://mdiv.dalmo.ai

## Product model

### Anonymous and browser-local for now

There are no user profiles or accounts in the current version. Course completion, lesson completion, and quiz results are stored in the browser with `localStorage`.

- no Dalmo/Viv profiles
- no streak
- no notebook
- no export/import workflow
- no server-side learner database

A future Google sign-in release can migrate browser-local progress into a cloud account.

### Canonical lesson content is static

The app does **not** generate summaries, quizzes, reflection questions, or transcripts at study time. Canonical lesson material is researched or generated once, reviewed, and committed to this repository.

Static source material lives in:

- `public/data/catalog.json` — courses, lecture metadata, provider links, assigned readings/resources
- `public/data/lectures/<lessonId>.json` — archived lecture transcripts and other source material
- `public/data/guides/<lessonId>.json` — static summaries, key ideas, mastery questions, reflection prompts, readings, and multiple-choice quizzes

The repository currently includes complete static transcript files for three imported lecture series:

- Dale B. Martin, Yale — *Introduction to New Testament* (26 lectures)
- Christine Hayes, Yale — *Introduction to the Old Testament* (24 lectures)
- Paul Freedman, Yale — *The Early Middle Ages* (22 lectures)

That is 72 transcript-backed lectures already bundled. The remaining catalog still needs systematic transcript and study-guide procurement. Missing static material is shown honestly in the interface rather than generated dynamically.

A future course-aware chatbot can use this static corpus as grounding context without changing the canonical lesson content.

## Curriculum UX

The visual language is deliberately tactile and progress-oriented: rounded surfaces, physical button depth, a teal learning path, concise copy, and playful course progression without copying Duolingo branding.

The curriculum remains organized by subject category. A prerequisite map additionally shows sensible learning sequences where dependencies matter, including:

- NT survey → Greek → NT exegesis method → book exegesis
- OT survey → Hebrew → OT exegesis method → book exegesis
- systematic-theology progression
- church-history progression
- philosophy progression

These arrows are editorial recommendations for this independent-study program, not formal prerequisites imposed by the original course providers.

## MDiv parity roadmap

The original curriculum is unusually deep in academic biblical studies and theology. To approach the content breadth of a contemporary MDiv, the next curriculum expansion should prioritize areas that are currently thin or absent:

1. preaching / homiletics
2. pastoral theology and pastoral care
3. Christian worship / liturgy
4. world Christianity and missions
5. non-Christian religions and interfaith engagement
6. church leadership and/or Christian education
7. public theology / church and society
8. supervised ministry / field education
9. an integrative capstone or seminar

Supervised ministry cannot be replaced by open courseware alone; the app can structure competencies, reflection, and documentation, but meaningful parity requires a real ministry context and human supervision.

Product roadmap after the current static-content build:

1. finish transcript procurement and static study guides for every indexed lecture
2. source open-course material for the missing MDiv practice/formation domains
3. improve prerequisite/dependency metadata from editorial heuristics into explicit course data
4. add Google OAuth and cloud progress sync
5. add a course-aware and lesson-aware chatbot grounded in the static corpus
6. add supervised-ministry/capstone workflows once the academic curriculum is mature

This project is an independent educational resource. It does not confer an accredited degree or claim accreditation.

## Development

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
```

Netlify publishes the Vite build configured by `netlify.toml`.
