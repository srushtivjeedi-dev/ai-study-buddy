
const notesInput = document.getElementById("notesInput");
const pdfInput = document.getElementById("pdfInput");
const pdfFileName = document.getElementById("pdfFileName");
const numQuestionsInput = document.getElementById("numQuestions");
const difficultySelect = document.getElementById("difficulty");
const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const quizContainer = document.getElementById("quizContainer");

let currentQuestions = [];
let userAnswers = [];
let extractedPdfText = "";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

pdfInput.addEventListener("change", async () => {
  const file = pdfInput.files[0];
  if (!file) return;

  pdfFileName.textContent = "📄 Reading PDF...";
  try {
    extractedPdfText = await extractTextFromPDF(file);
    pdfFileName.textContent = `✅ Loaded: ${file.name}`;
  } catch (err) {
    console.error(err);
    pdfFileName.textContent = "❌ Couldn't read that PDF";
    extractedPdfText = "";
  }
});

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

generateBtn.addEventListener("click", async () => {
  const typedNotes = notesInput.value.trim();
  const notes = extractedPdfText.trim() || typedNotes;

  if (!notes) {
    alert("Please paste some notes or upload a PDF first!");
    return;
  }

  const numQuestions = parseInt(numQuestionsInput.value) || 5;
  const difficulty = difficultySelect.value;

  loading.classList.remove("hidden");
  quizContainer.innerHTML = "";
  generateBtn.disabled = true;

  try {
    const quizData = await generateQuiz(notes, numQuestions, difficulty);
    displayQuiz(quizData);
  } catch (error) {
    console.error(error);
    quizContainer.innerHTML = `<p style="color:red;">Something went wrong: ${error.message}</p>`;
  } finally {
    loading.classList.add("hidden");
    generateBtn.disabled = false;
  }
});

async function generateQuiz(notes, numQuestions, difficulty) {
  const prompt = `
You are a quiz generator. Based on the following study notes, create exactly ${numQuestions} multiple-choice questions at a ${difficulty} difficulty level.

Respond ONLY with valid JSON in this exact format, and nothing else (no markdown, no backticks):

[
  {
    "question": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0
  }
]

Study notes:
"""${notes}"""
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "API request failed");
  }

  const data = await response.json();
  let text = data.candidates[0].content.parts[0].text;

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(text);
}

function displayQuiz(questions) {
  quizContainer.innerHTML = "";
  currentQuestions = questions;
  userAnswers = new Array(questions.length).fill(null);

  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${q.question}`;
    card.appendChild(title);

    q.options.forEach((optionText, optIndex) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = optionText;

      btn.addEventListener("click", () => {
        const allOptions = card.querySelectorAll(".option");
        allOptions.forEach(o => o.classList.remove("selected"));

        btn.classList.add("selected");
        userAnswers[index] = optIndex;
      });

      card.appendChild(btn);
    });

    quizContainer.appendChild(card);
  });

  const submitBtn = document.createElement("button");
  submitBtn.id = "submitQuizBtn";
  submitBtn.textContent = "Submit Quiz";
  submitBtn.addEventListener("click", checkAnswers);
  quizContainer.appendChild(submitBtn);
}

function checkAnswers() {
  let score = 0;

  currentQuestions.forEach((q, index) => {
    const card = quizContainer.querySelectorAll(".question-card")[index];
    const allOptions = card.querySelectorAll(".option");

    allOptions.forEach(o => o.disabled = true);

    const selectedIndex = userAnswers[index];

    if (selectedIndex === q.correctIndex) {
      score++;
      allOptions[selectedIndex].classList.add("correct");
    } else {
      if (selectedIndex !== null) {
        allOptions[selectedIndex].classList.add("wrong");
      }
      allOptions[q.correctIndex].classList.add("correct");
    }
  });

  document.getElementById("submitQuizBtn").remove();

  showScore(score, currentQuestions.length);
}

function showScore(score, total) {
  const percentage = Math.round((score / total) * 100);

  let message = "";
  if (percentage === 100) message = "🏆 Perfect score! You're a genius!";
  else if (percentage >= 70) message = "🎉 Great job! You know your stuff.";
  else if (percentage >= 40) message = "👍 Not bad, but a bit more revision will help.";
  else message = "📖 Time to hit the books again!";

  const scoreCard = document.createElement("div");
  scoreCard.className = "score-card";
  scoreCard.innerHTML = `
    <h2>${score} / ${total} (${percentage}%)</h2>
    <p>${message}</p>
  `;

  quizContainer.appendChild(scoreCard);
}