// =============== SkillFlow v4.5 ===============
// Supports hierarchical JSON + XP scaling + color-coded charts

let tasks = [];
let skillProgress = {};
let chart;

const XP_MULTIPLIERS = {
  Easy: 1,
  Medium: 1.5,
  Hard: 2
};

// ----------- LOAD DATA -----------
async function loadData() {
  try {
    const res = await fetch('data/tasks.json');
    const data = await res.json();
    tasks = [];

    // Flatten hierarchical structure (Skill → Subskill → Task)
    data.skills.forEach(skill => {
      skill.subskills.forEach(sub => {
        sub.tasks.forEach(task => {
          tasks.push({
            id: task.id,
            title: task.title,
            skill: skill.name,
            subskill: sub.name,
            color: skill.color,
            points: task.points,
            difficulty: task.difficulty,
            completed: task.completed,
            completedAt: task.completedAt
          });
        });
      });
    });

    // Load local progress if exists
    const saved = JSON.parse(localStorage.getItem('skillflowProgress'));
    if (saved) tasks = mergeSavedProgress(tasks, saved);

    updateUI();
    updateChart();
  } catch (err) {
    console.error('Error loading tasks:', err);
  }
}

// ----------- MERGE LOCAL PROGRESS -----------
function mergeSavedProgress(loaded, saved) {
  return loaded.map(task => {
    const match = saved.find(t => t.id === task.id);
    return match ? { ...task, ...match } : task;
  });
}

// ----------- UPDATE UI -----------
function updateUI() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  const grouped = groupBy(tasks, 'skill');

  for (const [skill, skillTasks] of Object.entries(grouped)) {
    const section = document.createElement('div');
    section.innerHTML = `<h3 style="color:${skillTasks[0].color}">${skill}</h3>`;
    skillTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task' + (task.completed ? ' completed' : '');
      div.innerHTML = `
        <span>${task.title} 
          <small>(${task.subskill} • ${task.difficulty})</small>
        </span>
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
      `;
      section.appendChild(div);
    });
    list.appendChild(section);
  }
}

// ----------- TOGGLE TASK -----------
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  saveProgress();
  updateUI();
  updateChart();
}

// ----------- SAVE TO LOCALSTORAGE -----------
function saveProgress() {
  localStorage.setItem('skillflowProgress', JSON.stringify(tasks));
}

// ----------- CALCULATE SKILL XP -----------
function calculateSkillProgress() {
  skillProgress = {};
  tasks.forEach(task => {
    const xp = task.completed
      ? task.points * (XP_MULTIPLIERS[task.difficulty] || 1)
      : 0;
    if (!skillProgress[task.skill]) skillProgress[task.skill] = { xp: 0, color: task.color };
    skillProgress[task.skill].xp += xp;
  });
}

// ----------- GROUP HELPER -----------
function groupBy(arr, key) {
  return arr.reduce((acc, obj) => {
    (acc[obj[key]] = acc[obj[key]] || []).push(obj);
    return acc;
  }, {});
}

// ----------- UPDATE CHART -----------
function updateChart() {
  calculateSkillProgress();

  const ctx = document.getElementById('skillChart');
  const labels = Object.keys(skillProgress);
  const data = labels.map(k => skillProgress[k].xp);
  const colors = labels.map(k => skillProgress[k].color);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Skill XP',
        data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      animation: { duration: 600, easing: 'easeOutBounce' },
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: '📈 Skill Growth by XP',
          font: { size: 18 }
        }
      }
    }
  });
}

loadData();
