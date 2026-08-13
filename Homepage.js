<<<<<<< HEAD
(function aiqCheckAuth() {
  const token = localStorage.getItem('aiq_token');
  const userRaw = localStorage.getItem('aiq_user');

  if (!token || !userRaw) {
    window.location.href = 'signin.html';
    return;
  }

  try {
    const user = JSON.parse(userRaw);
    document.addEventListener('DOMContentLoaded', function () {
      const nameEl = document.getElementById('aiq-user-name');
      if (nameEl) nameEl.textContent = user.fullName;
    });
  } catch (e) {
    localStorage.removeItem('aiq_token');
    localStorage.removeItem('aiq_user');
    window.location.href = 'signin.html';
  }
})();
let aiqCourseCount = 2;

document.getElementById('aiq-add-course-btn').addEventListener('click', function () {
  aiqCourseCount++;
  const num = String(aiqCourseCount).padStart(2, '0');
  const div = document.createElement('div');
  div.className = 'aiq-course';
  div.innerHTML = `
    <div class="aiq-course-top">
      <span class="aiq-course-num"><em>${num}</em> COURSE</span>
      <button class="aiq-trash" onclick="this.closest('.aiq-course').remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
      </button>
    </div>
    <div class="aiq-course-fields">
      <div><label>Course Name</label><input type="text" placeholder="e.g. Physics"></div>
      <div><label>Obtained GPA</label><input type="number" step="0.01" placeholder="0.00" class="aiq-course-gpa-input"></div>
      <div><label>Credits</label><input type="number" placeholder="3" class="aiq-course-credit-input"></div>
    </div>`;
  document.getElementById('aiq-course-list').appendChild(div);

  aiqEnforceCourseGpa(div.querySelector('.aiq-course-gpa-input'));
  aiqEnforceCourseCredits(div.querySelector('.aiq-course-credit-input'));
});

function aiqRestrictKeys(input, allowDecimal) {
  input.addEventListener('keydown', function (e) {
    const blocked = ['e', 'E', '+', '-'];
    if (blocked.includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (!allowDecimal && e.key === '.') {
      e.preventDefault();
      return;
    }
    if (allowDecimal && e.key === '.' && this.value.includes('.')) {
      e.preventDefault();
    }
  });
}

function aiqEnforceCgpa(input) {
  aiqRestrictKeys(input, true);
  input.addEventListener('input', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val)) { this.value = ''; return; }
    if (val > 4) this.value = 4;
    if (val < 0) this.value = 0;
  });
  input.addEventListener('blur', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val) || val < 0) this.value = 0;
    if (val > 4) this.value = 4;
  });
}

function aiqEnforceCredits(input) {
  aiqRestrictKeys(input, false);

  input.addEventListener('input', function () {
    if (this.value === '') return;
    let cleaned = this.value.replace(/[^0-9]/g, '');
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2);
    }
    this.value = cleaned;
    let val = parseInt(cleaned, 10);
    if (isNaN(val)) return;
    if (val > 99) this.value = 99;
    if (val < 0) this.value = 0;
  });

  input.addEventListener('blur', function () {
    if (this.value === '') { this.value = 0; return; }
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 0) this.value = 0;
    if (val > 99) this.value = 99;
  });
}

document.querySelectorAll('.aiq-credit-input').forEach(aiqEnforceCredits);
document.querySelectorAll('.aiq-cgpa-input').forEach(aiqEnforceCgpa);

function aiqEnforceCourseGpa(input) {
  aiqRestrictKeys(input, true);
  input.addEventListener('input', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val)) return;
    if (val > 4) this.value = 4;
    if (val < 0) this.value = 0;
  });
  input.addEventListener('blur', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val) || val < 0) this.value = 0;
    if (val > 4) this.value = 4;
  });
}

function aiqEnforceCourseCredits(input) {
  aiqRestrictKeys(input, false);
  input.addEventListener('input', function () {
    if (this.value === '') return;
    let cleaned = this.value.replace(/[^0-9]/g, '').slice(0, 1);
    this.value = cleaned;
    let val = parseInt(cleaned, 10);
    if (isNaN(val)) return;
    if (val > 3) this.value = 3;
  });
  input.addEventListener('blur', function () {
    if (this.value === '') { this.value = 1; return; }
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 1) this.value = 1;
    if (val > 3) this.value = 3;
  });
}

document.querySelectorAll('.aiq-course-gpa-input').forEach(aiqEnforceCourseGpa);
document.querySelectorAll('.aiq-course-credit-input').forEach(aiqEnforceCourseCredits);

function aiqColorForGpa(gpa) {
  if (gpa < 2.5) return '#dc4747';
  if (gpa < 3.0) return '#e08e1c';
  if (gpa < 3.5) return '#e0a51c';
  return '#1f9d4d';
}

function aiqBuildQualityMap(courses) {
  const map = {};
  courses.forEach(c => { map[c.name] = c; });
  return map;
}
function aiqShowAdvisorLoading() {
  document.getElementById('aiq-advisor-loading').style.display = 'flex';
  document.getElementById('aiq-advisor-error').style.display = 'none';
  document.getElementById('aiq-advisor-empty').style.display = 'none';
  document.getElementById('aiq-advisor-content').style.display = 'none';
}

function aiqRenderAdvisor(aiData, qualityMap) {
  document.getElementById('aiq-advisor-loading').style.display = 'none';
  document.getElementById('aiq-advisor-error').style.display = 'none';

  const hasContent = aiData && (aiData.summary || (aiData.weakestCourses && aiData.weakestCourses.length));
  if (!hasContent) {
    document.getElementById('aiq-advisor-empty').style.display = 'block';
    document.getElementById('aiq-advisor-content').style.display = 'none';
    return;
  }

  document.getElementById('aiq-advisor-empty').style.display = 'none';
  document.getElementById('aiq-advisor-content').style.display = 'block';
  document.getElementById('aiq-advisor-summary').textContent = aiData.summary || '';

  const priorities = (aiData.weakestCourses || []).slice(0, 3);
  const priorityLabel = document.getElementById('aiq-advisor-priorities-label');
  const priorityGrid = document.getElementById('aiq-priority-grid');

  if (priorities.length === 0) {
    priorityLabel.style.display = 'none';
    priorityGrid.innerHTML = '';
  } else {
    priorityLabel.style.display = 'block';
    priorityGrid.innerHTML = priorities.map((p, i) => `
      <div class="aiq-priority-card">
        <div class="aiq-priority-num">${i + 1}</div>
        <div class="aiq-priority-name">${p.course}</div>
        <div class="aiq-priority-reason">${p.reason || ''}</div>
      </div>
    `).join('');
  }

  const recs = aiData.recommendations || [];
  document.getElementById('aiq-advisor-recommendations').innerHTML = recs
    .map(r => `<div class="aiq-advisor-rec-item">${r}</div>`)
    .join('');
}

function aiqShowAdvisorError(message) {
  document.getElementById('aiq-advisor-loading').style.display = 'none';
  document.getElementById('aiq-advisor-content').style.display = 'none';
  document.getElementById('aiq-advisor-empty').style.display = 'none';
  const errEl = document.getElementById('aiq-advisor-error');
  errEl.style.display = 'block';
  errEl.textContent = message;
}
function exceedsScaleFromData(data) {
  return !!data.exceedsScale;
}

function aiqDisplayResults(data) {
  const qualityMap = aiqBuildQualityMap(data.courses);

  if (data.ai) {
    aiqRenderAdvisor(data.ai, qualityMap);
  } else {
    aiqShowAdvisorError('The AI advisor could not generate an analysis for this evaluation.');
  }
  const sortedCourses = [...data.courses].sort((a, b) => a.gpa - b.gpa);

  const requiredSGPA = data.requiredSGPA;
  const exceedsScale = data.exceedsScale;
  const requiredDisplay = requiredSGPA === null || requiredSGPA === undefined ? '—' : (exceedsScale ? '4.00+' : requiredSGPA.toFixed(2));

  const statGrid = document.getElementById('aiq-stat-grid');
  statGrid.innerHTML = `
    <div class="aiq-stat-card">
      <div class="aiq-stat-icon">◔</div>
      <div class="aiq-stat-value">${data.currentCGPA.toFixed(2)}</div>
      <div class="aiq-stat-label">Current CGPA</div>
    </div>
    <div class="aiq-stat-card">
      <div class="aiq-stat-icon">◎</div>
      <div class="aiq-stat-value">${data.targetCGPA.toFixed(2)}</div>
      <div class="aiq-stat-label">Target CGPA</div>
    </div>
    <div class="aiq-stat-card aiq-stat-highlight">
      <div class="aiq-stat-icon">⏳</div>
      <div class="aiq-stat-value">${requiredDisplay}</div>
      <div class="aiq-stat-label">Required Next SGPA</div>
      <div class="aiq-stat-sub">${exceedsScale ? 'Exceeds the scale' : 'Within reach next term'}</div>
    </div>
    <div class="aiq-stat-card">
      <div class="aiq-stat-icon">↗</div>
      <div class="aiq-stat-value">${data.projectedCGPA.toFixed(2)}</div>
      <div class="aiq-stat-label">Projected CGPA</div>
      <div class="aiq-stat-sub">Based on the entered courses</div>
    </div>
  `;

  const warningBanner = document.getElementById('aiq-warning-banner');
  warningBanner.classList.remove('aiq-banner-success');

  if (data.alreadyAchieved) {
    warningBanner.style.display = 'flex';
    warningBanner.classList.add('aiq-banner-success');
    warningBanner.innerHTML = `
      <span class="aiq-warn-icon">✓</span>
      <div>
        <strong>You've already reached your target CGPA.</strong>
        <span>Your current CGPA of ${data.currentCGPA.toFixed(2)} already meets or exceeds your target of ${data.targetCGPA.toFixed(2)}. Any passing SGPA next term keeps you there.</span>
      </div>
    `;
  } else if (exceedsScaleFromData(data)) {
    warningBanner.style.display = 'flex';
    warningBanner.innerHTML = `
      <span class="aiq-warn-icon">⚠</span>
      <div>
        <strong>Your target cannot be reached in one semester.</strong>
        <span>Reaching ${data.targetCGPA.toFixed(2)} would require an SGPA above the 4.00 scale next term. Consider spreading the goal across two semesters or adjusting your target slightly.</span>
      </div>
    `;
  } else {
    warningBanner.style.display = 'none';
  }

  const weakList = document.getElementById('aiq-weak-list');
  const weakest = data.ai.weakestCourses || [];
  weakList.innerHTML = weakest.length === 0
    ? `<p style="font-size:13.5px;color:#9a9dac;">No weak areas found — solid work across the board.</p>`
    : weakest.map((w, i) => {
        const match = qualityMap[w.course];
        const gpa = match ? match.gpa : 0;
        const label = gpa < 2.5 ? 'Weak' : (gpa < 3.5 ? 'Average' : 'Strong');
        return `
          <div class="aiq-weak-item">
            <div class="aiq-weak-item-top">
              <span class="aiq-weak-item-name"><span class="aiq-weak-num">${String(i + 1).padStart(2, '0')}</span>${w.course}</span>
              <span class="aiq-priority-badge aiq-priority-${w.priority.toLowerCase()}">${w.priority} priority</span>
            </div>
            <div class="aiq-weak-bar-row">
              <div class="aiq-weak-bar-track"><div class="aiq-weak-bar-fill" style="width:${(gpa / 4) * 100}%; background:${aiqColorForGpa(gpa)};"></div></div>
              <span class="aiq-weak-score">${gpa.toFixed(2)}</span>
            </div>
            <div class="aiq-weak-status">${w.reason || label}</div>
          </div>
        `;
      }).join('');

  const strongList = document.getElementById('aiq-strong-list');
  const strongest = data.ai.strongestCourses || [];
  strongList.innerHTML = strongest.length === 0
    ? `<p style="font-size:13.5px;color:#9a9dac;">No standout courses yet — keep working toward one.</p>`
    : strongest.map((name) => {
        const match = qualityMap[name];
        const gpa = match ? match.gpa : 0;
        return `
          <div class="aiq-strong-item">
            <div class="aiq-strong-icon">✓</div>
            <div>
              <div class="aiq-strong-name">${name}</div>
              <div class="aiq-strong-sub">Strong performance · ${gpa.toFixed(2)}</div>
            </div>
          </div>
        `;
      }).join('');

  const overviewList = document.getElementById('aiq-overview-list');
  overviewList.innerHTML = sortedCourses.map(c => {
    const label = c.gpa < 2.5 ? 'Weak' : (c.gpa < 3.5 ? 'Average' : 'Strong');
    const color = aiqColorForGpa(c.gpa);
    return `
      <div class="aiq-overview-row">
        <span class="aiq-overview-name">${c.name}</span>
        <div class="aiq-overview-track"><div class="aiq-overview-fill" style="width:${(c.gpa / 4) * 100}%; background:${color};"></div></div>
        <span class="aiq-overview-badge" style="background:${color};">${c.gpa.toFixed(2)}</span>
        <span class="aiq-overview-label">${label}</span>
      </div>
    `;
  }).join('');

  document.getElementById('aiq-goal-values').innerHTML = `
    <div><div class="aiq-goal-num">${data.currentCGPA.toFixed(2)}</div><div class="aiq-goal-lbl">Current</div></div>
    <div><div class="aiq-goal-num">${data.projectedCGPA.toFixed(2)}</div><div class="aiq-goal-lbl">Projected</div></div>
    <div><div class="aiq-goal-num">${data.targetCGPA.toFixed(2)}</div><div class="aiq-goal-lbl">Target</div></div>
  `;

  document.getElementById('aiq-empty-state').style.display = 'none';
  document.getElementById('aiq-results-panel').style.display = 'flex';
}

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
      courses.push({ name: (nameInput.value.trim() || 'Untitled Course'), gpa: gpa, credits: credits });
    }
  });

  if (courses.length === 0) {
    aiqShowAlert('Add at least one course with a valid GPA and credit hours before evaluating.');
    return;
  }

  const btn = document.querySelector('.aiq-evaluate-btn');
  const originalBtnText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Evaluating...';
aiqShowAdvisorLoading();
  let data;
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Server returned ${response.status}`);
    }

    data = await response.json();
  } catch (err) {
    aiqShowAlert('Could not reach the server: ' + err.message + ' Make sure the backend is running (npm run dev) on http://localhost:5000');
    aiqShowAdvisorError('Could not reach the server to generate advisor insights.');
    btn.disabled = false;
    btn.textContent = originalBtnText;
    return;
  }

  btn.disabled = false;
  btn.textContent = originalBtnText;

  aiqDisplayResults(data);

  document.getElementById('aiq-results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelector('.aiq-evaluate-btn').addEventListener('click', aiqRenderResults);

async function aiqLoadLastEntry() {
  try {
    const response = await fetch('http://localhost:5000/api/history');
    if (!response.ok) return;
    const records = await response.json();
    if (!records || records.length === 0) return;

    const latest = records[0];

    document.querySelectorAll('.aiq-cgpa-input')[0].value = latest.currentCGPA;
    document.querySelectorAll('.aiq-credit-input')[0].value = latest.completedCredits;
    document.querySelectorAll('.aiq-cgpa-input')[1].value = latest.targetCGPA;
    document.querySelectorAll('.aiq-credit-input')[1].value = latest.nextSemesterCredits;

    const list = document.getElementById('aiq-course-list');
    list.innerHTML = '';
    aiqCourseCount = 0;

    latest.courses.forEach(function (course) {
      aiqCourseCount++;
      const num = String(aiqCourseCount).padStart(2, '0');
      const div = document.createElement('div');
      div.className = 'aiq-course';
      div.innerHTML = `
        <div class="aiq-course-top">
          <span class="aiq-course-num"><em>${num}</em> COURSE</span>
          <button class="aiq-trash" onclick="this.closest('.aiq-course').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
          </button>
        </div>
        <div class="aiq-course-fields">
          <div><label>Course Name</label><input type="text" value="${course.name}"></div>
          <div><label>Obtained GPA</label><input type="number" step="0.01" value="${course.gpa}" class="aiq-course-gpa-input"></div>
          <div><label>Credits</label><input type="number" value="${course.credits}" class="aiq-course-credit-input"></div>
        </div>`;
      list.appendChild(div);
      aiqEnforceCourseGpa(div.querySelector('.aiq-course-gpa-input'));
      aiqEnforceCourseCredits(div.querySelector('.aiq-course-credit-input'));
    });

    const displayData = {
      currentCGPA: latest.currentCGPA,
      targetCGPA: latest.targetCGPA,
      requiredSGPA: latest.requiredSGPA,
      exceedsScale: latest.exceedsScale,
      projectedCGPA: latest.projectedCGPA,
      courses: latest.courses,
      ai: {
        summary: latest.aiSummary,
        weakestCourses: latest.aiWeakCoursesJson ? JSON.parse(latest.aiWeakCoursesJson) : [],
        strongestCourses: latest.aiStrongCoursesJson ? JSON.parse(latest.aiStrongCoursesJson) : [],
        recommendations: latest.aiRecommendationsJson ? JSON.parse(latest.aiRecommendationsJson) : []
      }
    };

    aiqDisplayResults(displayData);
  } catch (err) {
    console.error('Could not load previous entry:', err.message);
  }
}

window.addEventListener('DOMContentLoaded', aiqLoadLastEntry);

document.getElementById('aiq-reset-btn').addEventListener('click', function () {
  document.querySelectorAll('.aiq-cgpa-input').forEach(input => { input.value = 0; });
  document.querySelectorAll('.aiq-credit-input').forEach(input => { input.value = 0; });

  document.getElementById('aiq-course-list').innerHTML = '';
  aiqCourseCount = 0;

  document.getElementById('aiq-results-panel').style.display = 'none';
  document.getElementById('aiq-empty-state').style.display = 'flex';

  const btn = document.querySelector('.aiq-evaluate-btn');
  btn.disabled = false;
  btn.textContent = 'Evaluate My Performance →';
});

function aiqShowAlert(message) {
  document.getElementById('aiq-modal-message').textContent = message;
  document.getElementById('aiq-modal-overlay').classList.add('aiq-modal-open');
}

document.getElementById('aiq-modal-ok').addEventListener('click', function () {
  document.getElementById('aiq-modal-overlay').classList.remove('aiq-modal-open');
});

const AIQ_GRADE_SCALE = [
  { letter: 'A',  points: 4.0 },
  { letter: 'A-', points: 3.7 },
  { letter: 'B+', points: 3.3 },
  { letter: 'B',  points: 3.0 },
  { letter: 'B-', points: 2.7 },
  { letter: 'C+', points: 2.3 },
  { letter: 'C',  points: 2.0 },
  { letter: 'C-', points: 1.7 },
  { letter: 'D+', points: 1.3 },
  { letter: 'D',  points: 1.0 },
  { letter: 'F',  points: 0.0 }
];

function aiqGpaToLetter(gpa) {
  if (isNaN(gpa)) return 'B'; // sensible default for missing/invalid data
  let closest = AIQ_GRADE_SCALE[0];
  let smallestDiff = Math.abs(gpa - closest.points);
  AIQ_GRADE_SCALE.forEach(g => {
    const diff = Math.abs(gpa - g.points);
    if (diff < smallestDiff) { smallestDiff = diff; closest = g; }
  });
  return closest.letter;
}

function aiqLetterToPoints(letter) {
  const found = AIQ_GRADE_SCALE.find(g => g.letter === letter);
  return found ? found.points : 0;
}

function aiqBuildPlannerOptions(selectedLetter) {
  return AIQ_GRADE_SCALE.map(g =>
    `<option value="${g.points}" ${g.letter === selectedLetter ? 'selected' : ''}>${g.letter}</option>`
  ).join('');
}

function aiqGetPlannerCourses() {
  const courses = [];
  document.querySelectorAll('#aiq-course-list .aiq-course').forEach(function (courseEl) {
    const nameInput = courseEl.querySelector('.aiq-course-fields input[type="text"]');
    const gpaInput = courseEl.querySelector('.aiq-course-gpa-input');
    const creditInput = courseEl.querySelector('.aiq-course-credit-input');
    const gpa = parseFloat(gpaInput.value);
    const credits = parseInt(creditInput.value, 10);
    if (!isNaN(credits) && credits > 0) {
      courses.push({ name: (nameInput.value.trim() || 'Untitled Course'), gpa: gpa, credits: credits });
    }
  });
  return courses;
}

function aiqRecalculatePlanner() {
  const rows = document.querySelectorAll('#aiq-planner-course-list .aiq-planner-row');
  const sgpaEl = document.getElementById('aiq-planner-sgpa');
  const cgpaEl = document.getElementById('aiq-planner-cgpa');
  if (rows.length === 0) { sgpaEl.textContent = '--'; cgpaEl.textContent = '--'; return; }

  let totalCredits = 0;
  let totalPoints = 0;
  rows.forEach(row => {
    const credits = parseFloat(row.dataset.credits) || 0;
    const select = row.querySelector('.aiq-planner-grade-select');
    const points = parseFloat(select.value);
    if (!isNaN(points) && credits > 0) {
      totalCredits += credits;
      totalPoints += points * credits;
    }
  });

  if (totalCredits === 0) { sgpaEl.textContent = '--'; cgpaEl.textContent = '--'; return; }

  const sgpa = totalPoints / totalCredits;
  const currentCGPA = parseFloat(document.querySelectorAll('.aiq-cgpa-input')[0].value) || 0;
  const completedCredits = parseFloat(document.querySelectorAll('.aiq-credit-input')[0].value) || 0;
  const projectedCGPA = (currentCGPA * completedCredits + sgpa * totalCredits) / (completedCredits + totalCredits);

  sgpaEl.textContent = sgpa.toFixed(2);
  cgpaEl.textContent = projectedCGPA.toFixed(2);
}

function aiqRefreshPlanner() {
  const courses = aiqGetPlannerCourses();
  const emptyEl = document.getElementById('aiq-planner-empty');
  const bodyEl = document.getElementById('aiq-planner-body');
  const listEl = document.getElementById('aiq-planner-course-list');
  if (!emptyEl || !bodyEl || !listEl) return;

  if (courses.length === 0) {
    emptyEl.style.display = 'block';
    bodyEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  bodyEl.style.display = 'block';

  listEl.innerHTML = courses.map(c => {
    const letter = aiqGpaToLetter(c.gpa);
    return `
      <div class="aiq-planner-row" data-credits="${c.credits}" data-actual="${aiqLetterToPoints(letter)}">
        <span class="aiq-planner-course-name">${c.name}</span>
        <select class="aiq-planner-grade-select">${aiqBuildPlannerOptions(letter)}</select>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.aiq-planner-grade-select').forEach(sel => {
    sel.addEventListener('change', aiqRecalculatePlanner);
  });

  aiqRecalculatePlanner();
}

const aiqCourseListEl = document.getElementById('aiq-course-list');
if (aiqCourseListEl) {
  new MutationObserver(aiqRefreshPlanner).observe(aiqCourseListEl, { childList: true });
}

document.querySelectorAll('.aiq-cgpa-input')[0].addEventListener('input', aiqRecalculatePlanner);
document.querySelectorAll('.aiq-credit-input')[0].addEventListener('input', aiqRecalculatePlanner);

const aiqPlannerResetBtn = document.getElementById('aiq-planner-reset-btn');
if (aiqPlannerResetBtn) {
  aiqPlannerResetBtn.addEventListener('click', function () {
    document.querySelectorAll('#aiq-planner-course-list .aiq-planner-row').forEach(row => {
      row.querySelector('.aiq-planner-grade-select').value = row.dataset.actual;
    });
    aiqRecalculatePlanner();
  });
}

window.addEventListener('DOMContentLoaded', aiqRefreshPlanner);

const AIQ_MARKSHEET_MAX_BYTES = 8 * 1024 * 1024;
const AIQ_MARKSHEET_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
let aiqExtractedCourses = [];

function aiqSetMarksheetStatus(type, message) {
  const el = document.getElementById('aiq-marksheet-status');
  el.className = 'aiq-marksheet-status';
  if (!type) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'block';
  el.classList.add('aiq-status-' + type);
  if (type === 'loading') {
    el.innerHTML = `<div class="aiq-advisor-spinner"></div><span>${message}</span>`;
    el.style.display = 'flex';
  } else {
    el.textContent = message;
  }
}

const aiqMarksheetUploadBtn = document.getElementById('aiq-marksheet-upload-btn');
const aiqMarksheetInput = document.getElementById('aiq-marksheet-input');

if (aiqMarksheetUploadBtn && aiqMarksheetInput) {
  aiqMarksheetUploadBtn.addEventListener('click', function () {
    aiqMarksheetInput.click();
  });

  aiqMarksheetInput.addEventListener('change', async function () {
    const file = aiqMarksheetInput.files[0];
    aiqMarksheetInput.value = '';
    if (!file) return;

    if (!AIQ_MARKSHEET_ALLOWED_TYPES.includes(file.type)) {
      aiqSetMarksheetStatus('error', 'Unsupported file type. Please upload a PDF, JPG, or PNG.');
      return;
    }
    if (file.size > AIQ_MARKSHEET_MAX_BYTES) {
      aiqSetMarksheetStatus('error', 'File is too large. Maximum size is 8MB.');
      return;
    }

    aiqMarksheetUploadBtn.disabled = true;
    aiqSetMarksheetStatus('loading', 'Reading your marksheet with AI...');

    try {
      const formData = new FormData();
      formData.append('marksheet', file);

      const response = await fetch('http://localhost:5000/api/marksheet', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server returned ${response.status}`);
      }

      if (!result.courses || result.courses.length === 0) {
        aiqSetMarksheetStatus('info', result.message || 'No courses could be detected in this marksheet.');
        return;
      }

      aiqSetMarksheetStatus(null);
      aiqOpenMarksheetReview(result.courses);
    } catch (err) {
      aiqSetMarksheetStatus('error', 'Could not process this marksheet: ' + err.message);
    } finally {
      aiqMarksheetUploadBtn.disabled = false;
    }
  });
}

function aiqOpenMarksheetReview(courses) {
  aiqExtractedCourses = courses;
  const list = document.getElementById('aiq-marksheet-review-list');
  list.innerHTML = courses.map((c, i) => `
    <div class="aiq-marksheet-review-item" data-index="${i}">
      <input type="text" class="aiq-review-name" value="${c.name}">
      <input type="number" step="0.01" min="0" max="4" class="aiq-review-gpa" value="${c.gpa}">
      <input type="number" min="1" max="6" class="aiq-review-credits" value="${c.credits}">
    </div>
  `).join('');
  document.getElementById('aiq-marksheet-review-overlay').classList.add('aiq-modal-open');
}

const aiqMarksheetCancelBtn = document.getElementById('aiq-marksheet-cancel-btn');
if (aiqMarksheetCancelBtn) {
  aiqMarksheetCancelBtn.addEventListener('click', function () {
    document.getElementById('aiq-marksheet-review-overlay').classList.remove('aiq-modal-open');
  });
}

const aiqMarksheetConfirmBtn = document.getElementById('aiq-marksheet-confirm-btn');
if (aiqMarksheetConfirmBtn) {
  aiqMarksheetConfirmBtn.addEventListener('click', function () {
    const rows = document.querySelectorAll('#aiq-marksheet-review-list .aiq-marksheet-review-item');
    rows.forEach(row => {
      const name = row.querySelector('.aiq-review-name').value.trim() || 'Untitled Course';
      const gpa = parseFloat(row.querySelector('.aiq-review-gpa').value);
      const credits = parseInt(row.querySelector('.aiq-review-credits').value, 10);
      if (isNaN(gpa) || isNaN(credits) || credits < 1) return;

      aiqCourseCount++;
      const num = String(aiqCourseCount).padStart(2, '0');
      const div = document.createElement('div');
      div.className = 'aiq-course';
      div.innerHTML = `
        <div class="aiq-course-top">
          <span class="aiq-course-num"><em>${num}</em> COURSE</span>
          <button class="aiq-trash" onclick="this.closest('.aiq-course').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
          </button>
        </div>
        <div class="aiq-course-fields">
          <div><label>Course Name</label><input type="text" value="${name}"></div>
          <div><label>Obtained GPA</label><input type="number" step="0.01" value="${Math.max(0, Math.min(4, gpa))}" class="aiq-course-gpa-input"></div>
          <div><label>Credits</label><input type="number" value="${Math.max(1, Math.min(3, credits))}" class="aiq-course-credit-input"></div>
        </div>`;
      document.getElementById('aiq-course-list').appendChild(div);
      aiqEnforceCourseGpa(div.querySelector('.aiq-course-gpa-input'));
      aiqEnforceCourseCredits(div.querySelector('.aiq-course-credit-input'));
    });

    document.getElementById('aiq-marksheet-review-overlay').classList.remove('aiq-modal-open');
  });
}
const aiqLogoutBtn = document.getElementById('aiq-logout-btn');
if (aiqLogoutBtn) {
  aiqLogoutBtn.addEventListener('click', function () {
    localStorage.removeItem('aiq_token');
    localStorage.removeItem('aiq_user');
    window.location.href = 'signin.html';
  });
=======
(function aiqCheckAuth() {
  const token = localStorage.getItem('aiq_token');
  const userRaw = localStorage.getItem('aiq_user');

  if (!token || !userRaw) {
    window.location.href = 'signin.html';
    return;
  }

  try {
    const user = JSON.parse(userRaw);
    document.addEventListener('DOMContentLoaded', function () {
      const nameEl = document.getElementById('aiq-user-name');
      if (nameEl) nameEl.textContent = user.fullName;
    });
  } catch (e) {
    localStorage.removeItem('aiq_token');
    localStorage.removeItem('aiq_user');
    window.location.href = 'signin.html';
  }
})();
let aiqCourseCount = 2;

document.getElementById('aiq-add-course-btn').addEventListener('click', function () {
  aiqCourseCount++;
  const num = String(aiqCourseCount).padStart(2, '0');
  const div = document.createElement('div');
  div.className = 'aiq-course';
  div.innerHTML = `
    <div class="aiq-course-top">
      <span class="aiq-course-num"><em>${num}</em> COURSE</span>
      <button class="aiq-trash" onclick="this.closest('.aiq-course').remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
      </button>
    </div>
    <div class="aiq-course-fields">
      <div><label>Course Name</label><input type="text" placeholder="e.g. Physics"></div>
      <div><label>Obtained GPA</label><input type="number" step="0.01" placeholder="0.00" class="aiq-course-gpa-input"></div>
      <div><label>Credits</label><input type="number" placeholder="3" class="aiq-course-credit-input"></div>
    </div>`;
  document.getElementById('aiq-course-list').appendChild(div);

  aiqEnforceCourseGpa(div.querySelector('.aiq-course-gpa-input'));
  aiqEnforceCourseCredits(div.querySelector('.aiq-course-credit-input'));
});

function aiqRestrictKeys(input, allowDecimal) {
  input.addEventListener('keydown', function (e) {
    const blocked = ['e', 'E', '+', '-'];
    if (blocked.includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (!allowDecimal && e.key === '.') {
      e.preventDefault();
      return;
    }
    if (allowDecimal && e.key === '.' && this.value.includes('.')) {
      e.preventDefault();
    }
  });
}

function aiqEnforceCgpa(input) {
  aiqRestrictKeys(input, true);
  input.addEventListener('input', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val)) { this.value = ''; return; }
    if (val > 4) this.value = 4;
    if (val < 0) this.value = 0;
  });
  input.addEventListener('blur', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val) || val < 0) this.value = 0;
    if (val > 4) this.value = 4;
  });
}

function aiqEnforceCredits(input) {
  aiqRestrictKeys(input, false);

  input.addEventListener('input', function () {
    if (this.value === '') return;
    let cleaned = this.value.replace(/[^0-9]/g, '');
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2);
    }
    this.value = cleaned;
    let val = parseInt(cleaned, 10);
    if (isNaN(val)) return;
    if (val > 99) this.value = 99;
    if (val < 0) this.value = 0;
  });

  input.addEventListener('blur', function () {
    if (this.value === '') { this.value = 0; return; }
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 0) this.value = 0;
    if (val > 99) this.value = 99;
  });
}

document.querySelectorAll('.aiq-credit-input').forEach(aiqEnforceCredits);
document.querySelectorAll('.aiq-cgpa-input').forEach(aiqEnforceCgpa);

function aiqEnforceCourseGpa(input) {
  aiqRestrictKeys(input, true);
  input.addEventListener('input', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val)) return;
    if (val > 4) this.value = 4;
    if (val < 0) this.value = 0;
  });
  input.addEventListener('blur', function () {
    if (this.value === '') return;
    let val = parseFloat(this.value);
    if (isNaN(val) || val < 0) this.value = 0;
    if (val > 4) this.value = 4;
  });
}

function aiqEnforceCourseCredits(input) {
  aiqRestrictKeys(input, false);
  input.addEventListener('input', function () {
    if (this.value === '') return;
    let cleaned = this.value.replace(/[^0-9]/g, '').slice(0, 1);
    this.value = cleaned;
    let val = parseInt(cleaned, 10);
    if (isNaN(val)) return;
    if (val > 3) this.value = 3;
  });
  input.addEventListener('blur', function () {
    if (this.value === '') { this.value = 1; return; }
    let val = parseInt(this.value, 10);
    if (isNaN(val) || val < 1) this.value = 1;
    if (val > 3) this.value = 3;
  });
}

document.querySelectorAll('.aiq-course-gpa-input').forEach(aiqEnforceCourseGpa);
document.querySelectorAll('.aiq-course-credit-input').forEach(aiqEnforceCourseCredits);

function aiqColorForGpa(gpa) {
  if (gpa < 2.5) return '#dc4747';
  if (gpa < 3.0) return '#e08e1c';
  if (gpa < 3.5) return '#e0a51c';
  return '#1f9d4d';
}

function aiqBuildQualityMap(courses) {
  const map = {};
  courses.forEach(c => { map[c.name] = c; });
  return map;
}
function aiqShowAdvisorLoading() {
  document.getElementById('aiq-advisor-loading').style.display = 'flex';
  document.getElementById('aiq-advisor-error').style.display = 'none';
  document.getElementById('aiq-advisor-empty').style.display = 'none';
  document.getElementById('aiq-advisor-content').style.display = 'none';
}

function aiqRenderAdvisor(aiData, qualityMap) {
  document.getElementById('aiq-advisor-loading').style.display = 'none';
  document.getElementById('aiq-advisor-error').style.display = 'none';

  const hasContent = aiData && (aiData.summary || (aiData.weakestCourses && aiData.weakestCourses.length));
  if (!hasContent) {
    document.getElementById('aiq-advisor-empty').style.display = 'block';
    document.getElementById('aiq-advisor-content').style.display = 'none';
    return;
  }

  document.getElementById('aiq-advisor-empty').style.display = 'none';
  document.getElementById('aiq-advisor-content').style.display = 'block';
  document.getElementById('aiq-advisor-summary').textContent = aiData.summary || '';

  const priorities = (aiData.weakestCourses || []).slice(0, 3);
  const priorityLabel = document.getElementById('aiq-advisor-priorities-label');
  const priorityGrid = document.getElementById('aiq-priority-grid');

  if (priorities.length === 0) {
    priorityLabel.style.display = 'none';
    priorityGrid.innerHTML = '';
  } else {
    priorityLabel.style.display = 'block';
    priorityGrid.innerHTML = priorities.map((p, i) => `
      <div class="aiq-priority-card">
        <div class="aiq-priority-num">${i + 1}</div>
        <div class="aiq-priority-name">${p.course}</div>
        <div class="aiq-priority-reason">${p.reason || ''}</div>
      </div>
    `).join('');
  }

  const recs = aiData.recommendations || [];
  document.getElementById('aiq-advisor-recommendations').innerHTML = recs
    .map(r => `<div class="aiq-advisor-rec-item">${r}</div>`)
    .join('');
}

function aiqShowAdvisorError(message) {
  document.getElementById('aiq-advisor-loading').style.display = 'none';
  document.getElementById('aiq-advisor-content').style.display = 'none';
  document.getElementById('aiq-advisor-empty').style.display = 'none';
  const errEl = document.getElementById('aiq-advisor-error');
  errEl.style.display = 'block';
  errEl.textContent = message;
}
function exceedsScaleFromData(data) {
  return !!data.exceedsScale;
}

function aiqDisplayResults(data) {
  const qualityMap = aiqBuildQualityMap(data.courses);

  if (data.ai) {
    aiqRenderAdvisor(data.ai, qualityMap);
  } else {
    aiqShowAdvisorError('The AI advisor could not generate an analysis for this evaluation.');
  }
  const sortedCourses = [...data.courses].sort((a, b) => a.gpa - b.gpa);

  const requiredSGPA = data.requiredSGPA;
  const exceedsScale = data.exceedsScale;
  const requiredDisplay = requiredSGPA === null || requiredSGPA === undefined ? '—' : (exceedsScale ? '4.00+' : requiredSGPA.toFixed(2));

  const statGrid = document.getElementById('aiq-stat-grid');
  statGrid.innerHTML = `
    <div class="aiq-stat-card">
      <div class="aiq-stat-icon">◔</div>
      <div class="aiq-stat-value">${data.currentCGPA.toFixed(2)}</div>
      <div class="aiq-stat-label">Current CGPA</div>
    </div>
    <div class="aiq-stat-card">
      <div class="aiq-stat-icon">◎</div>
      <div class="aiq-stat-value">${data.targetCGPA.toFixed(2)}</div>
      <div class="aiq-stat-label">Target CGPA</div>
    </div>
    <div class="aiq-stat-card aiq-stat-highlight">
      <div class="aiq-stat-icon">⏳</div>
      <div class="aiq-stat-value">${requiredDisplay}</div>
      <div class="aiq-stat-label">Required Next SGPA</div>
      <div class="aiq-stat-sub">${exceedsScale ? 'Exceeds the scale' : 'Within reach next term'}</div>
    </div>
    <div class="aiq-stat-card">
      <div class="aiq-stat-icon">↗</div>
      <div class="aiq-stat-value">${data.projectedCGPA.toFixed(2)}</div>
      <div class="aiq-stat-label">Projected CGPA</div>
      <div class="aiq-stat-sub">Based on the entered courses</div>
    </div>
  `;

  const warningBanner = document.getElementById('aiq-warning-banner');
  warningBanner.classList.remove('aiq-banner-success');

  if (data.alreadyAchieved) {
    warningBanner.style.display = 'flex';
    warningBanner.classList.add('aiq-banner-success');
    warningBanner.innerHTML = `
      <span class="aiq-warn-icon">✓</span>
      <div>
        <strong>You've already reached your target CGPA.</strong>
        <span>Your current CGPA of ${data.currentCGPA.toFixed(2)} already meets or exceeds your target of ${data.targetCGPA.toFixed(2)}. Any passing SGPA next term keeps you there.</span>
      </div>
    `;
  } else if (exceedsScaleFromData(data)) {
    warningBanner.style.display = 'flex';
    warningBanner.innerHTML = `
      <span class="aiq-warn-icon">⚠</span>
      <div>
        <strong>Your target cannot be reached in one semester.</strong>
        <span>Reaching ${data.targetCGPA.toFixed(2)} would require an SGPA above the 4.00 scale next term. Consider spreading the goal across two semesters or adjusting your target slightly.</span>
      </div>
    `;
  } else {
    warningBanner.style.display = 'none';
  }

  const weakList = document.getElementById('aiq-weak-list');
  const weakest = data.ai.weakestCourses || [];
  weakList.innerHTML = weakest.length === 0
    ? `<p style="font-size:13.5px;color:#9a9dac;">No weak areas found — solid work across the board.</p>`
    : weakest.map((w, i) => {
        const match = qualityMap[w.course];
        const gpa = match ? match.gpa : 0;
        const label = gpa < 2.5 ? 'Weak' : (gpa < 3.5 ? 'Average' : 'Strong');
        return `
          <div class="aiq-weak-item">
            <div class="aiq-weak-item-top">
              <span class="aiq-weak-item-name"><span class="aiq-weak-num">${String(i + 1).padStart(2, '0')}</span>${w.course}</span>
              <span class="aiq-priority-badge aiq-priority-${w.priority.toLowerCase()}">${w.priority} priority</span>
            </div>
            <div class="aiq-weak-bar-row">
              <div class="aiq-weak-bar-track"><div class="aiq-weak-bar-fill" style="width:${(gpa / 4) * 100}%; background:${aiqColorForGpa(gpa)};"></div></div>
              <span class="aiq-weak-score">${gpa.toFixed(2)}</span>
            </div>
            <div class="aiq-weak-status">${w.reason || label}</div>
          </div>
        `;
      }).join('');

  const strongList = document.getElementById('aiq-strong-list');
  const strongest = data.ai.strongestCourses || [];
  strongList.innerHTML = strongest.length === 0
    ? `<p style="font-size:13.5px;color:#9a9dac;">No standout courses yet — keep working toward one.</p>`
    : strongest.map((name) => {
        const match = qualityMap[name];
        const gpa = match ? match.gpa : 0;
        return `
          <div class="aiq-strong-item">
            <div class="aiq-strong-icon">✓</div>
            <div>
              <div class="aiq-strong-name">${name}</div>
              <div class="aiq-strong-sub">Strong performance · ${gpa.toFixed(2)}</div>
            </div>
          </div>
        `;
      }).join('');

  const overviewList = document.getElementById('aiq-overview-list');
  overviewList.innerHTML = sortedCourses.map(c => {
    const label = c.gpa < 2.5 ? 'Weak' : (c.gpa < 3.5 ? 'Average' : 'Strong');
    const color = aiqColorForGpa(c.gpa);
    return `
      <div class="aiq-overview-row">
        <span class="aiq-overview-name">${c.name}</span>
        <div class="aiq-overview-track"><div class="aiq-overview-fill" style="width:${(c.gpa / 4) * 100}%; background:${color};"></div></div>
        <span class="aiq-overview-badge" style="background:${color};">${c.gpa.toFixed(2)}</span>
        <span class="aiq-overview-label">${label}</span>
      </div>
    `;
  }).join('');

  document.getElementById('aiq-goal-values').innerHTML = `
    <div><div class="aiq-goal-num">${data.currentCGPA.toFixed(2)}</div><div class="aiq-goal-lbl">Current</div></div>
    <div><div class="aiq-goal-num">${data.projectedCGPA.toFixed(2)}</div><div class="aiq-goal-lbl">Projected</div></div>
    <div><div class="aiq-goal-num">${data.targetCGPA.toFixed(2)}</div><div class="aiq-goal-lbl">Target</div></div>
  `;

  document.getElementById('aiq-empty-state').style.display = 'none';
  document.getElementById('aiq-results-panel').style.display = 'flex';
}

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
      courses.push({ name: (nameInput.value.trim() || 'Untitled Course'), gpa: gpa, credits: credits });
    }
  });

  if (courses.length === 0) {
    aiqShowAlert('Add at least one course with a valid GPA and credit hours before evaluating.');
    return;
  }

  const btn = document.querySelector('.aiq-evaluate-btn');
  const originalBtnText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Evaluating...';
aiqShowAdvisorLoading();
  let data;
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCGPA, completedCredits, targetCGPA, nextSemesterCredits, courses })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Server returned ${response.status}`);
    }

    data = await response.json();
  } catch (err) {
    aiqShowAlert('Could not reach the server: ' + err.message + ' Make sure the backend is running (npm run dev) on http://localhost:5000');
    aiqShowAdvisorError('Could not reach the server to generate advisor insights.');
    btn.disabled = false;
    btn.textContent = originalBtnText;
    return;
  }

  btn.disabled = false;
  btn.textContent = originalBtnText;

  aiqDisplayResults(data);

  document.getElementById('aiq-results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelector('.aiq-evaluate-btn').addEventListener('click', aiqRenderResults);

async function aiqLoadLastEntry() {
  try {
    const response = await fetch('http://localhost:5000/api/history');
    if (!response.ok) return;
    const records = await response.json();
    if (!records || records.length === 0) return;

    const latest = records[0];

    document.querySelectorAll('.aiq-cgpa-input')[0].value = latest.currentCGPA;
    document.querySelectorAll('.aiq-credit-input')[0].value = latest.completedCredits;
    document.querySelectorAll('.aiq-cgpa-input')[1].value = latest.targetCGPA;
    document.querySelectorAll('.aiq-credit-input')[1].value = latest.nextSemesterCredits;

    const list = document.getElementById('aiq-course-list');
    list.innerHTML = '';
    aiqCourseCount = 0;

    latest.courses.forEach(function (course) {
      aiqCourseCount++;
      const num = String(aiqCourseCount).padStart(2, '0');
      const div = document.createElement('div');
      div.className = 'aiq-course';
      div.innerHTML = `
        <div class="aiq-course-top">
          <span class="aiq-course-num"><em>${num}</em> COURSE</span>
          <button class="aiq-trash" onclick="this.closest('.aiq-course').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
          </button>
        </div>
        <div class="aiq-course-fields">
          <div><label>Course Name</label><input type="text" value="${course.name}"></div>
          <div><label>Obtained GPA</label><input type="number" step="0.01" value="${course.gpa}" class="aiq-course-gpa-input"></div>
          <div><label>Credits</label><input type="number" value="${course.credits}" class="aiq-course-credit-input"></div>
        </div>`;
      list.appendChild(div);
      aiqEnforceCourseGpa(div.querySelector('.aiq-course-gpa-input'));
      aiqEnforceCourseCredits(div.querySelector('.aiq-course-credit-input'));
    });

    const displayData = {
      currentCGPA: latest.currentCGPA,
      targetCGPA: latest.targetCGPA,
      requiredSGPA: latest.requiredSGPA,
      exceedsScale: latest.exceedsScale,
      projectedCGPA: latest.projectedCGPA,
      courses: latest.courses,
      ai: {
        summary: latest.aiSummary,
        weakestCourses: latest.aiWeakCoursesJson ? JSON.parse(latest.aiWeakCoursesJson) : [],
        strongestCourses: latest.aiStrongCoursesJson ? JSON.parse(latest.aiStrongCoursesJson) : [],
        recommendations: latest.aiRecommendationsJson ? JSON.parse(latest.aiRecommendationsJson) : []
      }
    };

    aiqDisplayResults(displayData);
  } catch (err) {
    console.error('Could not load previous entry:', err.message);
  }
}

window.addEventListener('DOMContentLoaded', aiqLoadLastEntry);

document.getElementById('aiq-reset-btn').addEventListener('click', function () {
  document.querySelectorAll('.aiq-cgpa-input').forEach(input => { input.value = 0; });
  document.querySelectorAll('.aiq-credit-input').forEach(input => { input.value = 0; });

  document.getElementById('aiq-course-list').innerHTML = '';
  aiqCourseCount = 0;

  document.getElementById('aiq-results-panel').style.display = 'none';
  document.getElementById('aiq-empty-state').style.display = 'flex';

  const btn = document.querySelector('.aiq-evaluate-btn');
  btn.disabled = false;
  btn.textContent = 'Evaluate My Performance →';
});

function aiqShowAlert(message) {
  document.getElementById('aiq-modal-message').textContent = message;
  document.getElementById('aiq-modal-overlay').classList.add('aiq-modal-open');
}

document.getElementById('aiq-modal-ok').addEventListener('click', function () {
  document.getElementById('aiq-modal-overlay').classList.remove('aiq-modal-open');
});

const AIQ_GRADE_SCALE = [
  { letter: 'A',  points: 4.0 },
  { letter: 'A-', points: 3.7 },
  { letter: 'B+', points: 3.3 },
  { letter: 'B',  points: 3.0 },
  { letter: 'B-', points: 2.7 },
  { letter: 'C+', points: 2.3 },
  { letter: 'C',  points: 2.0 },
  { letter: 'C-', points: 1.7 },
  { letter: 'D+', points: 1.3 },
  { letter: 'D',  points: 1.0 },
  { letter: 'F',  points: 0.0 }
];

function aiqGpaToLetter(gpa) {
  if (isNaN(gpa)) return 'B'; // sensible default for missing/invalid data
  let closest = AIQ_GRADE_SCALE[0];
  let smallestDiff = Math.abs(gpa - closest.points);
  AIQ_GRADE_SCALE.forEach(g => {
    const diff = Math.abs(gpa - g.points);
    if (diff < smallestDiff) { smallestDiff = diff; closest = g; }
  });
  return closest.letter;
}

function aiqLetterToPoints(letter) {
  const found = AIQ_GRADE_SCALE.find(g => g.letter === letter);
  return found ? found.points : 0;
}

function aiqBuildPlannerOptions(selectedLetter) {
  return AIQ_GRADE_SCALE.map(g =>
    `<option value="${g.points}" ${g.letter === selectedLetter ? 'selected' : ''}>${g.letter}</option>`
  ).join('');
}

function aiqGetPlannerCourses() {
  const courses = [];
  document.querySelectorAll('#aiq-course-list .aiq-course').forEach(function (courseEl) {
    const nameInput = courseEl.querySelector('.aiq-course-fields input[type="text"]');
    const gpaInput = courseEl.querySelector('.aiq-course-gpa-input');
    const creditInput = courseEl.querySelector('.aiq-course-credit-input');
    const gpa = parseFloat(gpaInput.value);
    const credits = parseInt(creditInput.value, 10);
    if (!isNaN(credits) && credits > 0) {
      courses.push({ name: (nameInput.value.trim() || 'Untitled Course'), gpa: gpa, credits: credits });
    }
  });
  return courses;
}

function aiqRecalculatePlanner() {
  const rows = document.querySelectorAll('#aiq-planner-course-list .aiq-planner-row');
  const sgpaEl = document.getElementById('aiq-planner-sgpa');
  const cgpaEl = document.getElementById('aiq-planner-cgpa');
  if (rows.length === 0) { sgpaEl.textContent = '--'; cgpaEl.textContent = '--'; return; }

  let totalCredits = 0;
  let totalPoints = 0;
  rows.forEach(row => {
    const credits = parseFloat(row.dataset.credits) || 0;
    const select = row.querySelector('.aiq-planner-grade-select');
    const points = parseFloat(select.value);
    if (!isNaN(points) && credits > 0) {
      totalCredits += credits;
      totalPoints += points * credits;
    }
  });

  if (totalCredits === 0) { sgpaEl.textContent = '--'; cgpaEl.textContent = '--'; return; }

  const sgpa = totalPoints / totalCredits;
  const currentCGPA = parseFloat(document.querySelectorAll('.aiq-cgpa-input')[0].value) || 0;
  const completedCredits = parseFloat(document.querySelectorAll('.aiq-credit-input')[0].value) || 0;
  const projectedCGPA = (currentCGPA * completedCredits + sgpa * totalCredits) / (completedCredits + totalCredits);

  sgpaEl.textContent = sgpa.toFixed(2);
  cgpaEl.textContent = projectedCGPA.toFixed(2);
}

function aiqRefreshPlanner() {
  const courses = aiqGetPlannerCourses();
  const emptyEl = document.getElementById('aiq-planner-empty');
  const bodyEl = document.getElementById('aiq-planner-body');
  const listEl = document.getElementById('aiq-planner-course-list');
  if (!emptyEl || !bodyEl || !listEl) return;

  if (courses.length === 0) {
    emptyEl.style.display = 'block';
    bodyEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  bodyEl.style.display = 'block';

  listEl.innerHTML = courses.map(c => {
    const letter = aiqGpaToLetter(c.gpa);
    return `
      <div class="aiq-planner-row" data-credits="${c.credits}" data-actual="${aiqLetterToPoints(letter)}">
        <span class="aiq-planner-course-name">${c.name}</span>
        <select class="aiq-planner-grade-select">${aiqBuildPlannerOptions(letter)}</select>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.aiq-planner-grade-select').forEach(sel => {
    sel.addEventListener('change', aiqRecalculatePlanner);
  });

  aiqRecalculatePlanner();
}

const aiqCourseListEl = document.getElementById('aiq-course-list');
if (aiqCourseListEl) {
  new MutationObserver(aiqRefreshPlanner).observe(aiqCourseListEl, { childList: true });
}

document.querySelectorAll('.aiq-cgpa-input')[0].addEventListener('input', aiqRecalculatePlanner);
document.querySelectorAll('.aiq-credit-input')[0].addEventListener('input', aiqRecalculatePlanner);

const aiqPlannerResetBtn = document.getElementById('aiq-planner-reset-btn');
if (aiqPlannerResetBtn) {
  aiqPlannerResetBtn.addEventListener('click', function () {
    document.querySelectorAll('#aiq-planner-course-list .aiq-planner-row').forEach(row => {
      row.querySelector('.aiq-planner-grade-select').value = row.dataset.actual;
    });
    aiqRecalculatePlanner();
  });
}

window.addEventListener('DOMContentLoaded', aiqRefreshPlanner);

const AIQ_MARKSHEET_MAX_BYTES = 8 * 1024 * 1024;
const AIQ_MARKSHEET_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
let aiqExtractedCourses = [];

function aiqSetMarksheetStatus(type, message) {
  const el = document.getElementById('aiq-marksheet-status');
  el.className = 'aiq-marksheet-status';
  if (!type) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'block';
  el.classList.add('aiq-status-' + type);
  if (type === 'loading') {
    el.innerHTML = `<div class="aiq-advisor-spinner"></div><span>${message}</span>`;
    el.style.display = 'flex';
  } else {
    el.textContent = message;
  }
}

const aiqMarksheetUploadBtn = document.getElementById('aiq-marksheet-upload-btn');
const aiqMarksheetInput = document.getElementById('aiq-marksheet-input');

if (aiqMarksheetUploadBtn && aiqMarksheetInput) {
  aiqMarksheetUploadBtn.addEventListener('click', function () {
    aiqMarksheetInput.click();
  });

  aiqMarksheetInput.addEventListener('change', async function () {
    const file = aiqMarksheetInput.files[0];
    aiqMarksheetInput.value = '';
    if (!file) return;

    if (!AIQ_MARKSHEET_ALLOWED_TYPES.includes(file.type)) {
      aiqSetMarksheetStatus('error', 'Unsupported file type. Please upload a PDF, JPG, or PNG.');
      return;
    }
    if (file.size > AIQ_MARKSHEET_MAX_BYTES) {
      aiqSetMarksheetStatus('error', 'File is too large. Maximum size is 8MB.');
      return;
    }

    aiqMarksheetUploadBtn.disabled = true;
    aiqSetMarksheetStatus('loading', 'Reading your marksheet with AI...');

    try {
      const formData = new FormData();
      formData.append('marksheet', file);

      const response = await fetch('http://localhost:5000/api/marksheet', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server returned ${response.status}`);
      }

      if (!result.courses || result.courses.length === 0) {
        aiqSetMarksheetStatus('info', result.message || 'No courses could be detected in this marksheet.');
        return;
      }

      aiqSetMarksheetStatus(null);
      aiqOpenMarksheetReview(result.courses);
    } catch (err) {
      aiqSetMarksheetStatus('error', 'Could not process this marksheet: ' + err.message);
    } finally {
      aiqMarksheetUploadBtn.disabled = false;
    }
  });
}

function aiqOpenMarksheetReview(courses) {
  aiqExtractedCourses = courses;
  const list = document.getElementById('aiq-marksheet-review-list');
  list.innerHTML = courses.map((c, i) => `
    <div class="aiq-marksheet-review-item" data-index="${i}">
      <input type="text" class="aiq-review-name" value="${c.name}">
      <input type="number" step="0.01" min="0" max="4" class="aiq-review-gpa" value="${c.gpa}">
      <input type="number" min="1" max="6" class="aiq-review-credits" value="${c.credits}">
    </div>
  `).join('');
  document.getElementById('aiq-marksheet-review-overlay').classList.add('aiq-modal-open');
}

const aiqMarksheetCancelBtn = document.getElementById('aiq-marksheet-cancel-btn');
if (aiqMarksheetCancelBtn) {
  aiqMarksheetCancelBtn.addEventListener('click', function () {
    document.getElementById('aiq-marksheet-review-overlay').classList.remove('aiq-modal-open');
  });
}

const aiqMarksheetConfirmBtn = document.getElementById('aiq-marksheet-confirm-btn');
if (aiqMarksheetConfirmBtn) {
  aiqMarksheetConfirmBtn.addEventListener('click', function () {
    const rows = document.querySelectorAll('#aiq-marksheet-review-list .aiq-marksheet-review-item');
    rows.forEach(row => {
      const name = row.querySelector('.aiq-review-name').value.trim() || 'Untitled Course';
      const gpa = parseFloat(row.querySelector('.aiq-review-gpa').value);
      const credits = parseInt(row.querySelector('.aiq-review-credits').value, 10);
      if (isNaN(gpa) || isNaN(credits) || credits < 1) return;

      aiqCourseCount++;
      const num = String(aiqCourseCount).padStart(2, '0');
      const div = document.createElement('div');
      div.className = 'aiq-course';
      div.innerHTML = `
        <div class="aiq-course-top">
          <span class="aiq-course-num"><em>${num}</em> COURSE</span>
          <button class="aiq-trash" onclick="this.closest('.aiq-course').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"/></svg>
          </button>
        </div>
        <div class="aiq-course-fields">
          <div><label>Course Name</label><input type="text" value="${name}"></div>
          <div><label>Obtained GPA</label><input type="number" step="0.01" value="${Math.max(0, Math.min(4, gpa))}" class="aiq-course-gpa-input"></div>
          <div><label>Credits</label><input type="number" value="${Math.max(1, Math.min(3, credits))}" class="aiq-course-credit-input"></div>
        </div>`;
      document.getElementById('aiq-course-list').appendChild(div);
      aiqEnforceCourseGpa(div.querySelector('.aiq-course-gpa-input'));
      aiqEnforceCourseCredits(div.querySelector('.aiq-course-credit-input'));
    });

    document.getElementById('aiq-marksheet-review-overlay').classList.remove('aiq-modal-open');
  });
}
const aiqLogoutBtn = document.getElementById('aiq-logout-btn');
if (aiqLogoutBtn) {
  aiqLogoutBtn.addEventListener('click', function () {
    localStorage.removeItem('aiq_token');
    localStorage.removeItem('aiq_user');
    window.location.href = 'signin.html';
  });
>>>>>>> 1d3d584c7dcb17c4f1af8e31f3c0cbef30430f23
}