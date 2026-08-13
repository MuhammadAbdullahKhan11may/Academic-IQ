/**
 * All academic math lives here. AI never touches these numbers.
 */

function calculateRequiredSGPA({ currentCGPA, completedCredits, targetCGPA, nextSemesterCredits }) {
  if (!nextSemesterCredits || nextSemesterCredits <= 0) return null;

  const required =
    (targetCGPA * (completedCredits + nextSemesterCredits) - currentCGPA * completedCredits) /
    nextSemesterCredits;

  return required;
}

function calculateProjectedCGPA({ currentCGPA, completedCredits, courses }) {
  const totalCourseCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  if (totalCourseCredits === 0) return currentCGPA;

  const courseQualityPoints = courses.reduce((sum, c) => sum + c.gpa * c.credits, 0);
  const projected =
    (currentCGPA * completedCredits + courseQualityPoints) / (completedCredits + totalCourseCredits);

  return projected;
}

function rankCourses(courses) {
  const sorted = [...courses].sort((a, b) => a.gpa - b.gpa);

  const weakest = sorted
    .filter((c) => c.gpa < 3.5)
    .map((c) => {
      let priority;
      if (c.gpa < 2.5) priority = 'High';
      else if (c.gpa < 3.0) priority = 'Medium';
      else priority = 'Low';
      return { ...c, priority };
    });

  const strongest = sorted.filter((c) => c.gpa >= 3.5).reverse();

  return { sorted, weakest, strongest };
}

function analyzeAcademics(input) {
  const { currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses } = input;

  const requiredSGPARaw = calculateRequiredSGPA({
    currentCGPA,
    completedCredits,
    targetCGPA,
    nextSemesterCredits,
  });

  // Target already met, or no more credits needed to hit it.
  const alreadyAchieved =
    currentCGPA >= targetCGPA || (requiredSGPARaw !== null && requiredSGPARaw <= 0);

  const exceedsScale = requiredSGPARaw !== null && requiredSGPARaw > 4;

  // A "required" GPA can't sensibly be negative - floor it at 0 for display,
  // but alreadyAchieved (above) is what tells the caller the real story.
  const requiredSGPA =
    requiredSGPARaw === null ? null : Math.max(0, Math.min(requiredSGPARaw, 4));

  const projectedCGPA = calculateProjectedCGPA({ currentCGPA, completedCredits, courses });
  const { sorted, weakest, strongest } = rankCourses(courses);

  return {
    requiredSGPA,
    requiredSGPARaw,
    exceedsScale,
    alreadyAchieved,
    projectedCGPA,
    sortedCourses: sorted,
    weakestCourses: weakest,
    strongestCourses: strongest,
  };
}

module.exports = {
  calculateRequiredSGPA,
  calculateProjectedCGPA,
  rankCourses,
  analyzeAcademics,
};
