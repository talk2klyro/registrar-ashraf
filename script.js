let tasks = [];
let skillProgress = {};

async function loadTasks() {
  const res = await fetch('data/tasks.json');
  const data = await res.json();
  tasks = data.tasks;
  updateUI();
  updateChart();
}

function updateUI() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task' + (task.completed ? ' completed' : '');
    div.innerHTML = `
      <span>${task.title} <small>(${task.skill})</small></span>
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
    `;
    list.appendChild(div);
  });
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  updateUI();
  updateChart();
}

function calculateSkillProgress() {
  skillProgress = {};
  tasks.forEach(task => {
    if (!skillProgress[task.skill]) skillProgress[task.skill] = 0;
    if (task.completed) skillProgress[task.skill] += task.points;
  });
}

let chart;
function updateChart() {
  calculateSkillProgress();

  const ctx = document.getElementById('skillChart');
  const labels = Object.keys(skillProgress);
  const data = Object.values(skillProgress);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Skill Progress',
        data,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

loadTasks();
