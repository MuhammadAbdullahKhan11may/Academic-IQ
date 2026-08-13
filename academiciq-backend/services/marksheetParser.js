const AI_API_URL = process.env.AI_API_URL || 'https://api.anthropic.com/v1/messages';
const AI_API_KEY = process.env.AI_API_KEY;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

function isAllowedMimeType(mimeType) {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

function buildContentBlock(buffer, mimeType) {
  const base64Data = buffer.toString('base64');
  if (mimeType === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } };
  }
  return { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } };
}

const EXTRACTION_PROMPT = `You are extracting academic course data from a student's marksheet/transcript image or PDF.

Return ONLY a JSON object (no markdown fences, no preamble) with this exact shape:

{
  "courses": [
    { "name": "Course Name", "gpa": 3.5, "credits": 3 }
  ]
}

Rules:
- "gpa" must be a number between 0.0 and 4.0. If the marksheet shows a letter grade (A, B+, C-, etc.) or a percentage/marks, convert it to the closest standard 4.0-scale GPA value. Do not invent grades that are not present.
- "credits" must be a whole number representing credit hours for that course.
- Only include rows that are clearly individual courses with a name, grade, and credit hours. Skip totals, headers, and summary rows.
- If you cannot confidently read any course rows, return { "courses": [] }.
- Do not perform any CGPA/SGPA calculations. Only extract raw per-course data.

Return valid JSON only.`;

async function parseMarksheet(fileBuffer, mimeType) {
  if (!isAllowedMimeType(mimeType)) {
    throw new Error('Unsupported file type. Please upload a PDF, JPG, or PNG.');
  }
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('File is too large. Maximum size is 8MB.');
  }
  if (!AI_API_KEY) {
    throw new Error('Marksheet extraction is not configured. Add AI_API_KEY to the backend .env file.');
  }

  const contentBlock = buildContentBlock(fileBuffer, mimeType);

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [contentBlock, { type: 'text', text: EXTRACTION_PROMPT }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`AI API returned ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  const cleaned = text.replace(/^```json\s*|```$/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('AI response could not be parsed as JSON.');
  }

  return validateAndCleanCourses(parsed);
}

function validateAndCleanCourses(parsed) {
  if (!parsed || !Array.isArray(parsed.courses)) {
    throw new Error('AI response did not contain a valid courses array.');
  }

  const cleaned = [];
  for (const c of parsed.courses) {
    if (!c || typeof c.name !== 'string' || !c.name.trim()) continue;
    let gpa = parseFloat(c.gpa);
    let credits = parseInt(c.credits, 10);
    if (isNaN(gpa)) continue;
    if (isNaN(credits)) credits = 3;
    gpa = Math.max(0, Math.min(4, gpa));
    credits = Math.max(1, Math.min(6, credits));
    cleaned.push({ name: c.name.trim().slice(0, 60), gpa: Math.round(gpa * 100) / 100, credits });
  }

  return cleaned;
}

module.exports = { parseMarksheet, isAllowedMimeType, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES };