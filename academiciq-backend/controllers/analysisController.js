const prisma = require('../services/db');
const { analyzeAcademics } = require('../services/academicCalculator');
const { getAIAnalysis } = require('../services/aiAdvisor');

function validateInput(body) {
  const { currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses } = body;

  // Number.isFinite (not typeof === 'number') so NaN/Infinity from bad
  // input are caught - typeof NaN is still 'number' and would slip through.
  if (!Number.isFinite(currentCGPA) || currentCGPA < 0 || currentCGPA > 4) return 'currentCGPA must be 0-4';
  if (!Number.isFinite(targetCGPA) || targetCGPA < 0 || targetCGPA > 4) return 'targetCGPA must be 0-4';
  if (!Number.isFinite(completedCredits) || completedCredits < 0 || completedCredits > 100)
    return 'completedCredits must be 0-100';
  if (!Number.isFinite(nextSemesterCredits) || nextSemesterCredits < 0 || nextSemesterCredits > 100)
    return 'nextSemesterCredits must be 0-100';
  if (!Array.isArray(courses) || courses.length === 0) return 'courses must be a non-empty array';

  for (const c of courses) {
    if (typeof c.name !== 'string' || !c.name.trim()) return 'each course needs a name';
    if (!Number.isFinite(c.gpa) || c.gpa < 0 || c.gpa > 4) return 'each course gpa must be 0-4';
    if (!Number.isFinite(c.credits) || c.credits < 1 || c.credits > 3) return 'each course credits must be 1-3';
  }

  return null;
}

async function analyze(req, res) {
  try {
    const error = validateInput(req.body);
    if (error) return res.status(400).json({ error });

    const { currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses } = req.body;

    // 1 & 2: reliable backend math
    const calc = analyzeAcademics({ currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses });

    // 3: send calculated results (not raw math task) to AI for qualitative analysis
    const ai = await getAIAnalysis({
      currentCGPA,
      targetCGPA,
      requiredSGPA: calc.requiredSGPA,
      exceedsScale: calc.exceedsScale,
      projectedCGPA: calc.projectedCGPA,
      sortedCourses: calc.sortedCourses,
      weakestCourses: calc.weakestCourses,
      strongestCourses: calc.strongestCourses,
    });

    // 4: persist this evaluation
    const saved = await prisma.analysisRecord.create({
      data: {
        currentCGPA,
        completedCredits,
        targetCGPA,
        nextSemesterCredits,
        requiredSGPA: calc.requiredSGPA,
        exceedsScale: calc.exceedsScale,
        projectedCGPA: calc.projectedCGPA,
        aiSummary: ai.summary,
        aiRecommendationsJson: JSON.stringify(ai.recommendations),
        aiWeakCoursesJson: JSON.stringify(ai.weakestCourses),
        aiStrongCoursesJson: JSON.stringify(ai.strongestCourses),
        courses: {
          create: courses.map((c) => ({ name: c.name, gpa: c.gpa, credits: c.credits })),
        },
      },
      include: { courses: true },
    });

    // 5: structured response to frontend
    res.json({
      id: saved.id,
      currentCGPA: saved.currentCGPA,
      targetCGPA: saved.targetCGPA,
      requiredSGPA: saved.requiredSGPA,
      exceedsScale: saved.exceedsScale,
      alreadyAchieved: calc.alreadyAchieved,
      projectedCGPA: saved.projectedCGPA,
      courses: saved.courses,
      ai: {
        summary: ai.summary,
        weakestCourses: ai.weakestCourses,
        strongestCourses: ai.strongestCourses,
        recommendations: ai.recommendations,
      },
      createdAt: saved.createdAt,
    });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Something went wrong while analyzing your data.' });
  }
}

async function getHistory(req, res) {
  try {
    const records = await prisma.analysisRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: { courses: true },
      take: 50,
    });
    res.json(records);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Could not load history.' });
  }
}

async function getOne(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const record = await prisma.analysisRecord.findUnique({
      where: { id },
      include: { courses: true },
    });

    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    console.error('Get one error:', err);
    res.status(500).json({ error: 'Could not load record.' });
  }
}

async function deleteOne(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    await prisma.analysisRecord.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Could not delete record.' });
  }
}

module.exports = { analyze, getHistory, getOne, deleteOne };
