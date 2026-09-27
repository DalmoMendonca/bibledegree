# Bible Degree

A free, browser-local companion for biblical studies. React + Vite, deployed on Netlify at https://mdiv.dalmo.ai.

## Run

`npm install`, then `npm run dev`. Build with `npm run build`; validate catalog and published study packs with `node scripts/validate-content.mjs`.

## Current behavior

One anonymous progress record lives in localStorage. No accounts, streaks, notebook, import/export, runtime AI, or paid API dependencies. Existing browser progress migrates from the earlier shared-profile format, combining completed lessons and best quiz results. New visitors start with no completed courses. Clearing browser storage removes progress.

Courses retain their subject categories. Seven editorial study paths connect foundations, languages, exegesis, and advanced studies. These are suggested sequences, not institutional prerequisites.

All lesson resources are static JSON. Only packs explicitly grounded in a transcript are displayed. Unprepared lessons clearly show their status and link to the original course. Study questions are independently prepared learning aids, not institutional assessments.

## Content coverage

62 courses / 1,686 listed full lectures, with 252 supplemental previews kept separately. 288 transcripts acquired and format-cleaned: 72 available inline and 216 linked to publishers. 147 publisher study-guide links and 44 static study packs with 682 multiple-choice questions. Missing content is marked with an icon and pack count on course cards, study paths, and course headers. See TRANSCRIPTS.md for the acquisition audit and ROADMAP.md for remaining work.

Yale transcripts retain source attribution and their CC BY-NC-SA license. Other publishers' materials are linked where republication permission is unverified or restricted. Source links do not imply affiliation. BiblicalTraining content is provided by BiblicalTraining.org; this project is not affiliated with BiblicalTraining.org.

`scripts/prepare-static-guides.py` reproducibly writes the four authored packs without calling an AI service. `archive/previous-edition` preserves historical source and is not part of the published site.
