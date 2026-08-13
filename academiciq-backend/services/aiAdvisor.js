/**
 * Calls the external AI API for qualitative analysis only.
 * The AI never does math - it only receives numbers already calculated
 * by academicCalculator.js and explains/prioritizes/recommends.
 */

const AI_API_URL = process.env.AI_API_URL || 'https://api.anthropic.com/v1/messages';
const AI_API_KEY = process.env.AI_API_KEY;

function buildPrompt({ currentCGPA, targetCGPA, requiredSGPA, exceedsScale, projectedCGPA, sortedCourses }) {
  return `You are an academic advisor AI. Given this student's ALREADY-CALCULATED data, return ONLY a JSON object (no markdown fences, no preamble) with this exact shape:

{
  "summary": "2-3 sentence plain-language summary of their standing",
  "weakestCourses": [{ "course": "name", "priority": "High|Medium|Low", "reason": "short reason" }],
  "strongestCourses": ["course name", ...],
  "recommendations": ["short actionable tip", ...]
}

Student data (all numbers are already correct - do not recalculate anything):
- Current CGPA: ${currentCGPA}
- Target CGPA: ${targetCGPA}
- Required next-semester SGPA: ${exceedsScale ? 'exceeds 4.00 scale' : requiredSGPA}
- Projected CGPA after this semester: ${projectedCGPA.toFixed(2)}
- Courses (name, GPA, credits): ${JSON.stringify(sortedCourses)}

Return valid JSON only.`;
}

async function getAIAnalysis(calculatedData) {
  if (!AI_API_KEY) {
    // No key configured - return a safe fallback instead of crashing.
    return fallbackAnalysis(calculatedData);
  }

  const prompt = buildPrompt(calculatedData);

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`AI API returned ${response.status}`);

    const data = await response.json();
    const text = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const cleaned = text.replace(/^```json\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return validateAIResponse(parsed) ? parsed : fallbackAnalysis(calculatedData);
  } catch (err) {
    console.error('AI advisor error:', err.message);
    return fallbackAnalysis(calculatedData);
  }
}

function validateAIResponse(obj) {
  return (
    obj &&
    typeof obj.summary === 'string' &&
    Array.isArray(obj.weakestCourses) &&
    Array.isArray(obj.strongestCourses) &&
    Array.isArray(obj.recommendations)
  );
}

function fallbackAnalysis({ weakestCourses, strongestCourses }) {
  return {
    summary: 'Analysis generated from your course data. Connect an AI API key for deeper personalized insights.',
    weakestCourses: weakestCourses.map((c) => ({
      course: c.name,
      priority: c.priority,
      reason: `GPA of ${c.gpa.toFixed(2)} is below target range.`,
    })),
    strongestCourses: strongestCourses.map((c) => c.name),
    recommendations: [
      'Focus additional study time on your lowest-GPA courses first.',
      'Meet with instructors for courses marked High priority.',
      'Keep doing what works in your strongest courses.',
    ],
  };
}

module.exports = { getAIAnalysis };
