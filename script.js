// === Local Storage Helpers ===
function loadData(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// === Users & Auth ===
let currentUser = null;
let users = loadData("users");

document.getElementById("btnRegister").addEventListener("click", () => {
  const name = document.getElementById("regName").value.trim();
  const user = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value.trim();
  if (!name || !user || !pass) return alert("Fill all fields");
  if (users.find(u => u.user === user)) return alert("Username already exists");

  users.push({ name, user, pass });
  saveData("users", users);
  alert("Registration successful. Please login.");
  document.getElementById("registerView").classList.add("hidden");
  document.getElementById("loginView").classList.remove("hidden");
});

document.getElementById("btnShowLogin").addEventListener("click", () => {
  document.getElementById("registerView").classList.add("hidden");
  document.getElementById("loginView").classList.remove("hidden");
});

document.getElementById("btnShowRegister").addEventListener("click", () => {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("registerView").classList.remove("hidden");
});

document.getElementById("btnLogin").addEventListener("click", () => {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const acc = users.find(u => u.user === user && u.pass === pass);
  if (!acc) return alert("Invalid credentials");

  currentUser = acc;
  document.getElementById("authArea").classList.add("hidden");
  document.getElementById("surveyArea").classList.remove("hidden");
  document.getElementById("headerUser").classList.remove("hidden");
  document.getElementById("hdrName").textContent = acc.name;
});

document.getElementById("btnLogout").addEventListener("click", () => {
  currentUser = null;
  document.getElementById("authArea").classList.remove("hidden");
  document.getElementById("surveyArea").classList.add("hidden");
  document.getElementById("headerUser").classList.add("hidden");
});

// === Questions ===
const defaultQuestions = [
  // Pre-contemplation
  "I do not see my behavior as a problem.",
  "I think people are exaggerating when they say my behavior is harmful.",
  "I do not plan to change my behavior in the next 6 months.",
  "I only came here because someone else told me to.",
  // Contemplation
  "I know my behavior is a problem, but I am not ready to change yet.",
  "I have mixed feelings about changing my behavior.",
  "I am thinking about changing within the next 6 months.",
  "I often weigh the pros and cons of changing.",
  // Preparation
  "I have decided to change my behavior within the next month.",
  "I have taken small steps towards change (e.g., gathering information, talking to others).",
  "I have a plan for how I will change my behavior.",
  "I have identified resources or support I can use.",
  // Action
  "I am currently taking steps to change my behavior.",
  "I am following a specific plan of action.",
  "I am making noticeable progress towards my goal.",
  "I regularly check my progress and adjust my approach if needed.",
  // Maintenance
  "I have maintained my new behavior for at least six months.",
  "I have strategies to deal with situations that might cause me to relapse.",
  "I feel confident I can maintain my change.",
  "My new behavior is now part of my normal life."
];

let questions = loadData("questions");
if (questions.length !== 20) {
  questions = defaultQuestions;
  saveData("questions", questions);
}

// === Render Questions ===
function renderSurvey() {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";
  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `
      <label>${i + 1}. ${q}</label><br>
      <select required name="q${i}">
        <option value="">--</option>
        <option value="1">1 Strongly Disagree</option>
        <option value="2">2 Disagree</option>
        <option value="3">3 Not Sure</option>
        <option value="4">4 Agree</option>
        <option value="5">5 Strongly Agree</option>
      </select>
    `;
    container.appendChild(div);
  });
}

// === Survey Flow ===
document.getElementById("btnEditQuestions").addEventListener("click", () => {
  const container = document.getElementById("editorContainer");
  container.innerHTML = "";
  questions.forEach((q, i) => {
    const input = document.createElement("textarea");
    input.value = q;
    input.dataset.index = i;
    input.className = "edit-question";
    container.appendChild(input);
  });
  document.getElementById("editorCard").classList.remove("hidden");
  document.getElementById("surveyForm").classList.add("hidden");
});

document.getElementById("btnSaveQuestions").addEventListener("click", () => {
  const inputs = document.querySelectorAll(".edit-question");
  questions = Array.from(inputs).map(i => i.value.trim() || "Untitled");
  saveData("questions", questions);
  alert("Questions updated!");
});

document.getElementById("btnStartSurvey").addEventListener("click", () => {
  document.getElementById("editorCard").classList.add("hidden");
  document.getElementById("surveyForm").classList.remove("hidden");
  renderSurvey();
});

document.getElementById("btnTakeSurvey").addEventListener("click", () => {
  document.getElementById("editorCard").classList.add("hidden");
  document.getElementById("surveyForm").classList.remove("hidden");
  renderSurvey();
});

// === Submit Answers ===
let chartInstance;
document.getElementById("btnSubmitAnswers").addEventListener("click", () => {
  const form = document.getElementById("surveyForm");
  const data = new FormData(form);
  let answers = [];
  for (let i = 0; i < 20; i++) {
    const v = parseInt(data.get("q" + i));
    if (isNaN(v)) return alert("Please answer all questions");
    answers.push(v);
  }

  // Calculate scores
  const scores = {
    PreContemplation: answers.slice(0, 4).reduce((a, b) => a + b, 0),
    Contemplation: answers.slice(4, 8).reduce((a, b) => a + b, 0),
    Preparation: answers.slice(8, 12).reduce((a, b) => a + b, 0),
    Action: answers.slice(12, 16).reduce((a, b) => a + b, 0),
    Maintenance: answers.slice(16, 20).reduce((a, b) => a + b, 0)
  };

  const avgs = {
    PreContemplation: (scores.PreContemplation / 4).toFixed(2),
    Contemplation: (scores.Contemplation / 4).toFixed(2),
    Preparation: (scores.Preparation / 4).toFixed(2),
    Action: (scores.Action / 4).toFixed(2),
    Maintenance: (scores.Maintenance / 4).toFixed(2)
  };

  const total = answers.reduce((a, b) => a + b, 0);
  const avgAll = (total / 20).toFixed(2);

  // Show report
  document.getElementById("surveyArea").classList.add("hidden");
  document.getElementById("resultsArea").classList.remove("hidden");

  document.getElementById("reportName").textContent = currentUser.name;
  document.getElementById("reportUser").textContent = "@" + currentUser.user;
  document.getElementById("reportDate").textContent = new Date().toLocaleString();

  const scoreBoxes = document.getElementById("scoreBoxes");
  scoreBoxes.innerHTML = `
    <div class="score-box">Pre-Contemplation: ${scores.PreContemplation} (avg ${avgs.PreContemplation})</div>
    <div class="score-box">Contemplation: ${scores.Contemplation} (avg ${avgs.Contemplation})</div>
    <div class="score-box">Preparation: ${scores.Preparation} (avg ${avgs.Preparation})</div>
    <div class="score-box">Action: ${scores.Action} (avg ${avgs.Action})</div>
    <div class="score-box">Maintenance: ${scores.Maintenance} (avg ${avgs.Maintenance})</div>
    <div class="score-box total">Total: ${total} (avg ${avgAll})</div>
  `;

  // Chart
  const ctx = document.getElementById("stageChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pre-Contemplation", "Contemplation", "Preparation", "Action", "Maintenance"],
      datasets: [{
        label: "Scores",
        data: [scores.PreContemplation, scores.Contemplation, scores.Preparation, scores.Action, scores.Maintenance],
        backgroundColor: "rgba(54, 162, 235, 0.7)"
      }]
    }
  });

  // Save to session for exports
  window.currentReport = { scores, avgs, total, avgAll, answers, user: currentUser, date: new Date().toISOString() };
});

// === Save Response ===
document.getElementById("btnSaveResponse").addEventListener("click", () => {
  let responses = loadData("responses");
  responses.push(window.currentReport);
  saveData("responses", responses);
  alert("Response saved!");
});

// === Export CSV (one report) ===
document.getElementById("btnExportCSV").addEventListener("click", () => {
  const r = window.currentReport;
  let csv = "Stage,Score,Average\n";
  Object.keys(r.scores).forEach(stage => {
    csv += `${stage},${r.scores[stage]},${r.avgs[stage]}\n`;
  });
  csv += `Total,${r.total},${r.avgAll}\n`;
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report.csv";
  a.click();
});

// === Download PDF ===
document.getElementById("btnDownloadPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Stages of Change Report", 10, 10);
  doc.text("Name: " + window.currentReport.user.name, 10, 20);
  doc.text("User: @" + window.currentReport.user.user, 10, 30);
  doc.text("Date: " + new Date(window.currentReport.date).toLocaleString(), 10, 40);

  let y = 60;
  Object.keys(window.currentReport.scores).forEach(stage => {
    doc.text(`${stage}: ${window.currentReport.scores[stage]} (avg ${window.currentReport.avgs[stage]})`, 10, y);
    y += 10;
  });
  doc.text(`Total: ${window.currentReport.total} (avg ${window.currentReport.avgAll})`, 10, y);
  doc.save("report.pdf");
});

// === View All Responses ===
document.getElementById("btnViewAll").addEventListener("click", () => {
  const all = loadData("responses");
  const tbody = document.querySelector("#responsesTable tbody");
  tbody.innerHTML = "";
  all.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(r.date).toLocaleString()}</td>
      <td>@${r.user.user}</td>
      <td>${Object.entries(r.scores).sort((a, b) => b[1] - a[1])[0][0]}</td>
      <td>${r.total}</td>
      <td><button class="ghost" onclick='alert("Not yet implemented")'>View</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById("resultsArea").classList.add("hidden");
  document.getElementById("allResponsesArea").classList.remove("hidden");
});

document.getElementById("btnCloseAll").addEventListener("click", () => {
  document.getElementById("allResponsesArea").classList.add("hidden");
  document.getElementById("resultsArea").classList.remove("hidden");
});

// === Export All Responses to CSV ===
document.getElementById("btnExportAll").addEventListener("click", () => {
  const all = loadData("responses");
  let csv = "Date,User,PreContemplation,Contemplation,Preparation,Action,Maintenance,Total,AvgAll\n";
  all.forEach(r => {
    csv += `${new Date(r.date).toLocaleString()},@${r.user.user},${r.scores.PreContemplation},${r.scores.Contemplation},${r.scores.Preparation},${r.scores.Action},${r.scores.Maintenance},${r.total},${r.avgAll}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "all_responses.csv";
  a.click();
});

// === Finish / Logout ===
document.getElementById("btnFinish").addEventListener("click", () => {
  currentUser = null;
  document.getElementById("resultsArea").classList.add("hidden");
  document.getElementById("authArea").classList.remove("hidden");
  document.getElementById("headerUser").classList.add("hidden");
});
