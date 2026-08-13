# AcademicIQ Backend

Node.js + Express + SQLite (via Prisma) backend, matching the project's PHASE 2-4 structure.

## Setup

```bash
cd academiciq-backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Server runs at `http://localhost:5000`.

## What each command does

- `npm install` — installs Express, Prisma, CORS, dotenv.
- `cp .env.example .env` — creates your local env file. Open `.env` and paste your AI API key into `AI_API_KEY` when you're ready for Phase 4 (optional for now — without a key, the API still works and returns a fallback analysis instead of crashing).
- `npx prisma migrate dev --name init` — creates `prisma/dev.db` (your actual SQLite database file) and the `AnalysisRecord`/`Course` tables from `prisma/schema.prisma`.
- `npm run dev` — starts the server with auto-reload on file changes.

## Endpoints

| Method | Path                | Does |
|--------|---------------------|------|
| POST   | `/api/analyze`      | Validates input, calculates SGPA/CGPA, calls AI, saves the record, returns full analysis |
| GET    | `/api/history`      | Returns the last 50 saved analyses |
| GET    | `/api/analyze/:id`  | Returns one saved analysis by id |
| DELETE | `/api/analyze/:id`  | Deletes one saved analysis |
| GET    | `/api/health`       | Simple uptime check |

## Viewing your data

```bash
npx prisma studio
```
Opens a browser UI at `http://localhost:5555` where you can see/edit every row in `dev.db` directly.

## Connecting your frontend

In your `script.js`, replace the local `aiqRenderResults()` calculation logic with a fetch call:

```javascript
async function aiqRenderResults() {
  const currentCGPA = parseFloat(document.querySelectorAll('.aiq-cgpa-input')[0].value) || 0;
  const completedCredits = parseFloat(document.querySelectorAll('.aiq-credit-input')[0].value) || 0;
  const targetCGPA = parseFloat(document.querySelectorAll('.aiq-cgpa-input')[1].value) || 0;
  const nextSemesterCredits = parseFloat(document.querySelectorAll('.aiq-credit-input')[1].value) || 0;

  const courses = [];
  document.querySelectorAll('#aiq-course-list .aiq-course').forEach(function (courseEl) {
    const nameInput = courseEl.querySelector('.aiq-course-fields input[type="text"]');
    const gpaInput = courseEl.querySelector('.aiq-course-gpa-input');
    const creditInput = courseEl.querySelector('.aiq-course-credit-input');
    const gpa = parseFloat(gpaInput.value);
    const credits = parseInt(creditInput.value, 10);
    if (!isNaN(gpa) && !isNaN(credits) && credits > 0) {
      courses.push({ name: nameInput.value.trim() || 'Untitled Course', gpa, credits });
    }
  });

  if (courses.length === 0) {
    alert('Add at least one course with a valid GPA and credit hours before evaluating.');
    return;
  }

  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses })
  });

  const data = await response.json();
  // map data into the same DOM elements your current render function fills in
}
```

Say the word and I'll rewrite the rest of your render function to match this response shape exactly.
