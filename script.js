let questions = [];
let currentQuestion = 0;
let userAnswers = {};
let score = { correct: 0, wrong: 0 };
let filteredQuestions = [];

// Load questions from JSON
fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    filteredQuestions = [...questions];
    init();
  });

function init() {
  updateStats();
  loadQuestion(currentQuestion);
  renderQuestionList();
  setupFilters();
}

function loadQuestion(index) {
  if (filteredQuestions.length === 0) return;
  const q = filteredQuestions[index];
  document.getElementById('lecture-title').textContent = `Lecture: ${q.lecture}`;
  document.getElementById('question-text').textContent = `${index + 1}. ${q.question}`;
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const optEl = document.createElement('div');
    optEl.className = 'option';
    optEl.textContent = opt;
    optEl.onclick = () => selectOption(i);
    container.appendChild(optEl);
  });
  updateButtons();
  showExplanationIfExists();
  highlightInList(index);
}

function selectOption(optIndex) {
  const q = filteredQuestions[currentQuestion];
  const correct = optIndex === q.correct;
  const globalIndex = questions.findIndex(qst => qst.id === q.id);
  userAnswers[globalIndex] = { selected: optIndex, correct };
  if (correct) score.correct++;
  else score.wrong++;
  updateStats();
  highlightAnswer(optIndex, q.correct);
  showExplanation();
  renderQuestionList();
}

function highlightAnswer(selected, correct) {
  const options = document.querySelectorAll('.option');
  options.forEach((opt, idx) => {
    opt.classList.remove('correct', 'wrong');
    if (idx === correct) opt.classList.add('correct');
    if (idx === selected && idx !== correct) opt.classList.add('wrong');
  });
}

function showExplanation() {
  const exp = document.getElementById('explanation');
  exp.textContent = `✅ Answer: ${filteredQuestions[currentQuestion].explanation}`;
  exp.style.display = 'block';
}

function showExplanationIfExists() {
  const exp = document.getElementById('explanation');
  const q = filteredQuestions[currentQuestion];
  const globalIndex = questions.findIndex(qst => qst.id === q.id);
  if (userAnswers[globalIndex]) {
    exp.style.display = 'block';
    exp.textContent = `✅ Answer: ${q.explanation}`;
  } else {
    exp.style.display = 'none';
  }
}

function updateStats() {
  const totalAttempted = Object.keys(userAnswers).length;
  document.getElementById('total').textContent = questions.length;
  document.getElementById('correct').textContent = score.correct;
  document.getElementById('wrong').textContent = score.wrong;
  const perc = questions.length ? Math.round((score.correct / questions.length) * 100) : 0;
  document.getElementById('percentage').textContent = `${perc}%`;
}

function updateButtons() {
  document.getElementById('prev-btn').disabled = currentQuestion === 0;
  document.getElementById('next-btn').disabled = currentQuestion === filteredQuestions.length - 1;
}

document.getElementById('prev-btn').onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion(currentQuestion);
  }
};

document.getElementById('next-btn').onclick = () => {
  if (currentQuestion < filteredQuestions.length - 1) {
    currentQuestion++;
    loadQuestion(currentQuestion);
  }
};

function renderQuestionList() {
  const container = document.getElementById('questions-list');
  container.innerHTML = '';
  filteredQuestions.forEach((q, idx) => {
    const globalIndex = questions.findIndex(qst => qst.id === q.id);
    const div = document.createElement('div');
    div.className = `q-item ${userAnswers[globalIndex] ? 'attempted' : 'not-attempted'}`;
    div.textContent = `Q${idx + 1}: ${q.question.substring(0, 50)}...`;
    div.onclick = () => {
      currentQuestion = idx;
      loadQuestion(idx);
    };
    container.appendChild(div);
  });
}

function highlightInList(index) {
  const items = document.querySelectorAll('.q-item');
  items.forEach((item, idx) => {
    item.classList.remove('active');
    if (idx === index) item.classList.add('active');
  });
}

function setupFilters() {
  document.querySelectorAll('#lecture-filter button').forEach(btn => {
    btn.onclick = () => {
      const lecture = btn.getAttribute('data-lecture');
      if (lecture === 'all') {
        filteredQuestions = [...questions];
      } else {
        filteredQuestions = questions.filter(q => q.lecture === lecture);
      }
      currentQuestion = 0;
      loadQuestion(0);
      renderQuestionList();
    };
  });
}