import { auth, db } from './firebase-config.js';
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
    doc, getDoc, collection, setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let currentUser;
const allowedEmails = ["omkarchikkodi26@gmail.com", "rahulpattadi@gmail.com"];


document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
        showPopup("User not logged in");
        window.location.href = 'login.html';
        return;
    }

    // ✅ Show uploader link only to admin
    if (allowedEmails.includes(user.email)) {
        const quizUploaderLink = document.getElementById("quizUploaderLink");
        if (quizUploaderLink) {
            quizUploaderLink.style.display = "list-item";
        }
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("authStatus").textContent = `👋 Welcome, ${user.email}`;
        document.getElementById("quizArea").style.display = "block";
    } else {
        showPopup("Please log in to attempt the quiz.");
        window.location.href = "login.html";
    }
});

window.loadQuiz = async function () {
    const subject = document.getElementById("subjectSelect").value;
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";

    if (!subject) return showPopup("<h2>🚫 No subject chosen.</h2><p>Please select a subject.</p>");

    const todayKey = new Date().toISOString().split("T")[0];
    const attemptRef = doc(db, "quiz_attempts", currentUser.uid);
    const attemptSnap = await getDoc(attemptRef);
    const data = attemptSnap.data();
    const existingAttempt = data?.attempts?.[todayKey]?.[subject];


    // const todayKey = new Date().toISOString().split("T")[0];
    const quizDoc = await getDoc(doc(db, "quizzes", subject));
    const questions = quizDoc.data()?.[todayKey]?.questions;

    if (!quizDoc.exists()) {
        return showPopup("❌ No quiz found for this subject.");
    }

    // const { questions } = quizDoc.data();

    if (existingAttempt) {
        document.getElementById("quizForm").style.display = "block";
        document.getElementById("quizSubmit").style.display = "none";

        const { answers, score } = existingAttempt;
        console.log("Ans : " + answers);
        console.log("Score : " + score);

        questions.forEach((q, i) => {
            const ans = answers[i];
            const userAns = ans.selected;
            const correctAns = ans.correct;
            const isCorrect = ans.isCorrect;

            const div = document.createElement("div");
            div.classList.add("question-card", isCorrect ? "correct" : "incorrect");
            div.style.padding = "12px";
            div.style.marginBottom = "10px";
            div.style.borderRadius = "8px";

            //     div.innerHTML = `
            //     <h4>Q${i + 1}. ${q.question}</h4>
            //     <p>Your answer: <b style="color:${isCorrect ? 'green' : 'red'}">${userAns}</b></p>
            //     <p>Correct answer: <b>${correctAns}</b></p>
            // `;

            const optionLabels = {
                a: q.a,
                b: q.b,
                c: q.c,
                d: q.d
            };

            let optionsHtml = "";
            for (const [key, value] of Object.entries(optionLabels)) {
                const checked = key === userAns ? "checked" : "";
                const color =
                    key === correctAns
                        ? "green"
                        : key === userAns
                            ? "red"
                            : "black";

                optionsHtml += `
            <label style="color:${color}; display: block; margin-bottom: 6px;">
                <input type="radio" name="q${i}" value="${key}" disabled ${checked}>
                <b>${key.toUpperCase()}.</b> ${value}
            </label>`;
            }

            div.innerHTML = `
                <h4>Q${i + 1}. ${q.question}</h4>
                ${optionsHtml}
                <p style="margin-top: 5px;"><b>Score:</b> ${isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
                `;

            container.appendChild(div);
            console.log("div appended");
        });

        showPopup(`📌 Already attempted today! Score: ${score}/100`);
        return;
    }


    // If not attempted yet, show quiz
    questions.forEach((q, i) => {
        const div = document.createElement("div");
        div.classList.add("question-block");

        div.innerHTML = `
        <div class="question-header">
        <h4>Q${i + 1}. ${q.question}</h4>
        </div>
        <div class="options-group">
        <label><input type="radio" name="q${i}" value="a"> ${q.a}</label>
        <label><input type="radio" name="q${i}" value="b"> ${q.b}</label>
        <label><input type="radio" name="q${i}" value="c"> ${q.c}</label>
        <label><input type="radio" name="q${i}" value="d"> ${q.d}</label>
        </div>
        `;

        container.appendChild(div);
    });


    document.getElementById("quizForm").style.display = "block";

    // 👇 Submit logic inside quizForm.onsubmit
    document.getElementById("quizForm").onsubmit = async (e) => {
        e.preventDefault();

        const answers = [];
        let score = 0;

        questions.forEach((q, i) => {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            const selectedVal = selected ? selected.value : "none";
            const isCorrect = selectedVal === q.correct;

            answers.push({
                question: q.question,
                selected: selectedVal,
                correct: q.correct,
                isCorrect
            });

            if (isCorrect) score += 10;
        });

        const quizDocRef = doc(db, "quiz_attempts", currentUser.uid);
        const todayKey = new Date().toISOString().split("T")[0];

        const attemptSnap = await getDoc(quizDocRef);
        let existingData = attemptSnap.exists() ? attemptSnap.data() : {};

        const newAttempt = {
            score,
            answers,
            submittedAt: new Date()
        };

        const updatedData = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email.split("@")[0],
            attempts: {
                ...(existingData.attempts || {}),
                [todayKey]: {
                    ...(existingData.attempts?.[todayKey] || {}),
                    [subject]: newAttempt
                }
            }
        };

        await setDoc(quizDocRef, updatedData, { merge: true });

        document.getElementById("quizForm").style.display = "block";
        container.innerHTML = ""; // Clear old form

        questions.forEach((q, i) => {
            const ans = answers[i];
            const userAns = ans.selected;
            const correctAns = ans.correct;
            const isCorrect = ans.isCorrect;

            const div = document.createElement("div");
            div.classList.add("question-card", isCorrect ? "correct" : "incorrect");
            div.style.padding = "12px";
            div.style.marginBottom = "10px";
            div.style.borderRadius = "8px";

            //     div.innerHTML = `
            //     <h4>Q${i + 1}. ${q.question}</h4>
            //     <p>Your answer: <b style="color:${isCorrect ? 'green' : 'red'}">${userAns}</b></p>
            //     <p>Correct answer: <b>${correctAns}</b></p>
            // `;

            const optionLabels = {
                a: q.a,
                b: q.b,
                c: q.c,
                d: q.d
            };

            let optionsHtml = "";
            for (const [key, value] of Object.entries(optionLabels)) {
                const checked = key === userAns ? "checked" : "";
                const color =
                    key === correctAns
                        ? "green"
                        : key === userAns
                            ? "red"
                            : "black";

                optionsHtml += `
            <label style="color:${color}; display: block; margin-bottom: 6px;">
                <input type="radio" name="q${i}" value="${key}" disabled ${checked}>
                <b>${key.toUpperCase()}.</b> ${value}
            </label>`;
            }

            div.innerHTML = `
                <h4>Q${i + 1}. ${q.question}</h4>
                ${optionsHtml}
                <p style="margin-top: 5px;"><b>Score:</b> ${isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
                `;

            container.appendChild(div);
            console.log("div appended");
            document.getElementById("quizSubmit").style.display = "none";
        });

        showPopup(`✅ Quiz submitted! You scored ${score}/100`);

    };
}


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