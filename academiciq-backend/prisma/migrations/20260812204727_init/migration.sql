-- CreateTable
CREATE TABLE "AnalysisRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentCGPA" REAL NOT NULL,
    "completedCredits" REAL NOT NULL,
    "targetCGPA" REAL NOT NULL,
    "nextSemesterCredits" REAL NOT NULL,
    "requiredSGPA" REAL,
    "exceedsScale" BOOLEAN NOT NULL DEFAULT false,
    "projectedCGPA" REAL NOT NULL,
    "aiSummary" TEXT,
    "aiRecommendationsJson" TEXT,
    "aiWeakCoursesJson" TEXT,
    "aiStrongCoursesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gpa" REAL NOT NULL,
    "credits" INTEGER NOT NULL,
    "analysisRecordId" INTEGER NOT NULL,
    CONSTRAINT "Course_analysisRecordId_fkey" FOREIGN KEY ("analysisRecordId") REFERENCES "AnalysisRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
