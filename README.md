# Grade 3 Studio

A learning studio for an Alberta grade 3 student: Math Quest, Spell Builder, Type Rocket, Grammar Garage and Science Lab, sharing one player profile, rewards and parent dashboard.

Live site: https://rossmc05.github.io/yycgrade3/

## What's in it now

Every subject is tagged to the Alberta grade 3 programs of study (Math 2022, English Language Arts and Literature 2023, Science 2023).

- **Math Quest** (16 skills): place value to 100 000, money, adding and subtracting within 1000, estimating, multiplying and dividing within 100, fractions to twelfths, equations, number patterns, time, length and perimeter, shapes and angles, graphs, financial literacy.
- **Spell Builder** (11 skills): the weekly school spelling list (entered on the parent dashboard and read aloud), grade 3 words, plurals, -ing and -ed, contractions, abbreviations, prefixes, suffixes, compound words, homophones, synonyms and antonyms, silent letters. Canadian spelling.
- **Grammar Garage** (8 skills): parts of speech, subject and predicate, verb agreement, conjunctions, sentence types, capitals, commas, quotation marks and apostrophes, similes.
- **Type Rocket** (15 lessons): home row outward, with an on-screen keyboard showing which finger to use, words per minute, accuracy and stars. Needs a physical keyboard.
- **Science Lab** (7 skills, each with a short lesson): states of matter, the water cycle, materials and changes, forces and simple machines, food chains and animals, Earth's surface and Alberta dinosaurs, computational thinking.

Shared by every subject:

- **Adaptive practice**: 3 right in a row moves up a level, 2 misses moves down. A first miss shows a hint; a second shows the answer and explanation. Missed questions come back in later sessions.
- **Mastery and review**: a skill is mastered at 90% over 20 answers at its top level, on at least two days. Mastered skills return in the daily warm-up after 1, 3, 7, 21 and 60 days.
- **Rewards**: XP and player levels, coins, a daily streak, badges for every mastered skill, and a shop of hats, pets and backgrounds.
- **Parent dashboard** (behind a 4-digit PIN): weekly activity, accuracy and level per curriculum outcome, recent trouble spots, the spelling list, daily goal, session length, read-aloud, and backup/restore.
- Questions can be read aloud with the browser's built-in voice. Works on tablets and phones, and offline once loaded.

## Development

```
npm install
npm run dev     # local server
npm test        # engine and question-generator tests
npm run build   # production build into dist/
```

Built with React, TypeScript and Vite. Every push to `main` runs the tests and publishes to GitHub Pages (`.github/workflows/deploy.yml`).

Progress is stored in the browser (`localStorage`) on each device. Use the parent dashboard's backup to move it.

## Layout

```
src/engine/      adaptive levels, mastery, rewards, storage, speech (shared by all subjects)
src/subjects/    one folder per subject; math/skills.ts holds the Math Quest skills
src/screens/     home, subject, play session, rewards, parent dashboard, profiles
src/components/  top bar, question pictures (clock, coins, fraction bars, graphs…)
tests/           vitest tests
```

A subject is a list of `Skill` objects (see `src/engine/types.ts`), each tagged with its Alberta outcome and a `generate(level, rng)` function. Adding a subject means adding its skills to `src/subjects/index.ts`.
