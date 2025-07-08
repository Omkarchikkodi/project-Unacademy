import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const allowedEmails = ["omkarchikkodi26@gmail.com", "rahulpattadi@gmail.com"];

const statusDiv = document.getElementById("authStatus");
const container = document.getElementById("quizFormContainer");

onAuthStateChanged(auth, (user) => {
  if (allowedEmails.includes(user.email)) {
    const quizUploaderLink = document.getElementById("quizUploaderLink");
    if (quizUploaderLink) {
      quizUploaderLink.style.display = "list-item";
    }
    statusDiv.innerText = "✅ Logged in as Admin";
    container.style.display = "block";
    loadForm();
  } else {
    statusDiv.innerText = "❌ Access Denied. Only Admin can view this page.";
  }
});

function loadForm() {
  const questionContainer = document.getElementById("questionContainer");
  for (let i = 1; i <= 10; i++) {
    const div = document.createElement("div");
    div.innerHTML = `
          <h4>Q${i}</h4>
          <input type="text" id="q${i}" placeholder="Enter question ${i}">
          <input type="text" id="q${i}_a" placeholder="Option A">
          <input type="text" id="q${i}_b" placeholder="Option B">
          <input type="text" id="q${i}_c" placeholder="Option C">
          <input type="text" id="q${i}_d" placeholder="Option D">
          <select id="q${i}_correct">
            <option value="">-- Correct Option --</option>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
            <option value="d">D</option>
          </select>
          <hr>`;
    questionContainer.appendChild(div);
  }
}

async function submitQuiz() {
  const subject = document.getElementById("subjectSelect").value;
  const questions = [];

  // 👇 Generate today's key (or customize format)
  const todayKey = new Date().toISOString().split("T")[0]; // "2025-07-08"

  for (let i = 1; i <= 10; i++) {
    const q = document.getElementById(`q${i}`);
    const a = document.getElementById(`q${i}_a`);
    const b = document.getElementById(`q${i}_b`);
    const c = document.getElementById(`q${i}_c`);
    const d = document.getElementById(`q${i}_d`);
    const correct = document.getElementById(`q${i}_correct`);

    if (!q || !a || !b || !c || !d || !correct) {
      showPopup(`Some fields are missing for question ${i}`);
      return;
    }

    if (!q.value || !a.value || !b.value || !c.value || !d.value || !correct.value) {
      showPopup(`Please fill all fields for question ${i}`);
      return;
    }

    questions.push({
      question: q.value,
      a: a.value,
      b: b.value,
      c: c.value,
      d: d.value,
      correct: correct.value
    });
  }

  try {
    // 👇 Merge with existing subject doc, using today's date as the key
    await setDoc(
      doc(db, "quizzes", subject),
      { [todayKey]: { questions } },
      { merge: true } // ← Important to avoid overwriting other days
    );

    showPopup(`✅ Quiz submitted for ${subject} on ${todayKey}`);
  } catch (err) {
    console.error("❌ Error saving quiz:", err);
    showPopup("❌ Failed to save quiz. Try again.");
  }
}

// Attach listener
document.getElementById("submitBtn").addEventListener("click", submitQuiz);

function showPopup(message) {
  const overlay = document.getElementById("popupOverlay");
  const msgBox = document.getElementById("popupMessage");

  msgBox.innerHTML = message;
  overlay.classList.remove("hidden");
  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 5000);
}

window.addEventListener("load", () => {
  const overlay = document.getElementById("loaderOverlay");

  // Ensure loader is visible at least 1.5 seconds
  const minLoadTime = 1500; // in ms
  //   const loadStart = performance.timing.navigationStart;
  const now = performance.now();
  const timeSinceStart = now; // since navigationStart

  const delay = Math.max(minLoadTime - timeSinceStart, 0);

  setTimeout(() => {
    overlay.classList.add("hide");
    setTimeout(() => {
      overlay.remove();
    }, 500); // allow fade-out transition
  }, delay);
});