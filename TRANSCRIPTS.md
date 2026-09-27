# Transcript acquisition status

Updated 2026-09-27. Counts describe acquired text, not verification against audio. Formatting cleanup preserves the lecturer’s wording. Publisher texts without republication permission remain linked rather than mirrored in the app.

288 transcripts acquired and format-cleaned; 44 static study packs; 682 multiple-choice questions.

## Access and matching barriers

- BiblicalTraining: direct retrieval encountered a Cloudflare verification challenge. Its copyright terms restrict reposting; authorized transcript exports can support preparation while the app links to the originals.
- YouTube: automated caption access encountered a verification challenge. Caption files or authorized downloadable audio would enable further preparation; alternate original-publisher sources are still being investigated.
- Reasonable Faith: only pages embedding the exact catalog video ID are matched. Similar titles and matching part numbers alone are insufficient.
- Five catalog courses still lack a verified lecture list. Their missing lectures are not included in the numerical backlog.

## Course coverage

| Course | Listed lectures | Text acquired | Study packs |
|---|---:|---:|---:|
| Intro to the NT: Gospels and Acts | 40 | 0 | 0 |
| Intro to the NT: Romans to Revelation | 37 | 0 | 0 |
| Introduction to New Testament | 26 | 26 | 18 |
| New Testament Survey: Gospels | 33 | 0 | 0 |
| New Testament Survey: Acts to Revelation | 59 | 0 | 0 |
| New Testament: Its Structure, Content, and Theology | 31 | 0 | 0 |
| Old Testament Survey | 19 | 0 | 0 |
| Introduction to the Old Testament | 24 | 24 | 14 |
| Biblical Greek | 0 | 0 | 0 |
| Greek Exegesis I | 13 | 0 | 0 |
| Greek Exegesis II | 20 | 0 | 0 |
| Galatians | 15 | 0 | 0 |
| Hebrews | 25 | 0 | 0 |
| Acts | 23 | 0 | 0 |
| Romans | 53 | 0 | 0 |
| Romans | 18 | 18 | 0 |
| Matthew | 19 | 19 | 0 |
| 1 Corinthians | 33 | 33 | 0 |
| Revelation | 23 | 0 | 0 |
| Hebrew I | 23 | 0 | 0 |
| Hebrew II | 26 | 0 | 0 |
| Hebrew Exegesis I | 11 | 0 | 0 |
| Hebrew Exegesis II | 13 | 0 | 0 |
| Proverbs | 27 | 0 | 0 |
| Psalms | 27 | 27 | 0 |
| Job | 30 | 30 | 0 |
| Church History I | 13 | 0 | 0 |
| Early and Medieval Church History | 59 | 0 | 0 |
| Church History II | 21 | 0 | 0 |
| Reformation and Modern Church History | 44 | 0 | 0 |
| Systematic Theology I | 27 | 0 | 0 |
| Systematic Theology II | 26 | 0 | 0 |
| Biblical Theology | 22 | 0 | 0 |
| Christian Ethics | 22 | 0 | 0 |
| Christian Apologetics | 30 | 0 | 0 |
| History of Philosophy and Christian Thought | 31 | 0 | 0 |
| History of Philosophy and Christian Thought | 0 | 0 | 0 |
| History of Ancient Philosophy | 25 | 0 | 0 |
| History of Modern Philosophy | 25 | 0 | 0 |
| Introduction to Philosophy | 40 | 0 | 0 |
| Introduction to Philosophy | 10 | 0 | 0 |
| A History of Philosophy | 81 | 0 | 0 |
| Ancient and Medieval Philosophy | 0 | 0 | 0 |
| Philosophy and Christian Thought | 0 | 0 | 0 |
| Old Testament Theology | 20 | 0 | 0 |
| New Testament Theology | 14 | 0 | 0 |
| Historical Theology I | 25 | 0 | 0 |
| Historical Theology II | 0 | 0 | 0 |
| Pastoral Epistles | 19 | 0 | 0 |
| Textual Criticism | 36 | 0 | 0 |
| Cultural World of the New Testament | 8 | 8 | 0 |
| Apocrypha | 9 | 9 | 0 |
| Old Testament Backgrounds | 23 | 23 | 0 |
| Lewis and Tolkien | 20 | 0 | 0 |
| Luther and Calvin | 35 | 0 | 0 |
| Early Middle Ages | 22 | 22 | 12 |
| Symbolic Logic | 15 | 0 | 0 |
| The London Latin Course | 100 | 0 | 0 |
| Doctrine of Christ | 52 | 49 | 0 |
| The Atonement | 60 | 0 | 0 |
| The Analytic Tradition | 37 | 0 | 0 |
| Ideas of the Twentieth Century | 47 | 0 | 0 |

The complete per-lesson audit is in `public/data/transcript-audit.json`. A missing transcript is marked not-yet-acquired rather than presumed nonexistent.

## Resuming preparation

1. Acquire full text from the original publisher and verify the lecture match.
2. Run `python scripts/clean-transcripts.py` and inspect the cleaned text. Formatting cleanup is not a claim of audio verification.
3. Prepare a static guide from the complete transcript. Include summary, outline, mastery answers, reflection prompts, and explained multiple-choice questions.
4. Run `python scripts/build-transcript-audit.py`, `node scripts/validate-content.mjs`, and `npm run build` before publication.
