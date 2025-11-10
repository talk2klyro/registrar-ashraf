let tasks = [];
let skillProgress = {};
let chart;
let streakData = { lastDate: null, streak: 0 };
let xpData = { totalXP: 0, level: 1 };

// === Load Everything ===
async function loadData() {
  const localTasks = localStorage.getItem('skillflow-tasks');
  const localStreak = localStorage.getItem('skillflow-streak');
  const localXP = localStorage.getItem('skillflow-xp');

  if (localStreak) streakData = JSON.parse(localStreak);
  if (localXP) xpData = JSON.parse(localXP);

  if (localTasks) {
    tasks = JSON.parse(localTasks);
  } else {
    const res = await fetch('data/tasks.json');
    const data = await res.json();
    tasks = data.tasks;
  }

  updateSkillGroups();
  updateChart();
  showInsights();
  updateStreakBox();
  updateLevelUI();
}

// === Save All ===
function saveAll() {
  localStorage.setItem('skillflow-tasks', JSON.stringify(tasks));
  localStorage.setItem('skillflow-streak', JSON.stringify(streakData));
  localStorage.setItem('skillflow-xp', JSON.stringify(xpData));
}

// === XP + Level Logic ===
function addXP(points) {
  const before = xpData.level;
  xpData.totalXP += points;
  const newLevel = Math.floor(xpData.totalXP / 100) + 1;
  if (newLevel > xpData.level) {
    xpData.level = newLevel;
    showLevelUpToast();
  }
  saveAll();
  updateLevelUI();
}

function removeXP(points) {
  xpData.totalXP = Math.max(0, xpData.totalXP - points);
  xpData.level = Math.floor(xpData.totalXP / 100) + 1;
  saveAll();
  updateLevelUI();
}

function updateLevelUI() {
  const levelNum = document.getElementById('level-number');
  const xpText = document.getElementById('xp-text');
  const ring = document.getElementById('xp-progress');

  const currentXP = xpData.totalXP % 100;
  const percent = currentXP / 100;
  const circumference = 2 * Math.PI * 35;
  const offset = circumference * (1 - percent);

  levelNum.textContent = xpData.level;
  xpText.textContent = `${currentXP} / 100 XP`;
  ring.style.strokeDashoffset = offset;
}

// === Toast Animation ===
function showLevelUpToast() {
  const toast = document.getElementById('level-up-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

// === Toggle Task (XP integrated) ===
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.completed ? addXP(task.points) : removeXP(task.points);

  updateStreak();
  saveAll();
  updateSkillGroups();
  updateChart();
  showInsights();
  updateStreakBox();
}

// === Existing Streak, Group, Chart, Insight Functions (from Phase 3) ===
// keep all previous functions (groupBySkill, updateSkillGroups, calculateSkillProgress, etc.)
// just make sure loadData() calls updateLevelUI() at the end.

window.onload = loadData;
