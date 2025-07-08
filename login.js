import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.getElementById("loginEmail").addEventListener("input", async function () {
  const emailInput = this.value.trim();
  const statusEl = document.getElementById("emailStatus");

  if (!emailInput.includes("@")) {
    statusEl.textContent = "";
    return;
  }

  try {
    const q = query(collection(db, "users"), where("email", "==", emailInput));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const method = userData.signupMethod || "unknown";

      if (method === "google") {
        statusEl.style.color = "red";
        statusEl.textContent = "❌ This account was signed up using Google. Please use Google Login.";
      } else if (method === "email") {
        statusEl.style.color = "green";
        statusEl.textContent = "✅ Account found. You can login with email and password.";
      } else {
        statusEl.style.color = "orange";
        statusEl.textContent = "⚠️ Unknown signup method. Try both login options.";
      }
    } else {
      statusEl.style.color = "red";
      statusEl.innerHTML = `❌ No account found with this email. Please <a href='signup.html' style='text-decoration: none; color: blue;'>sign up</a>.`;
    }
  } catch (err) {
    console.error("Firestore email check error (login):", err);
    statusEl.style.color = "red";
    statusEl.textContent = "❌ Error checking email.";
  }
});


document.querySelector('button[onclick="loginUser()"]').onclick = () => {
  showLoader();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Input validation
  if (!email || !email.includes("@") || !email.includes(".")) {
    showPopup("❌ Please enter a valid email address.");
    hideLoader();
    return;
  }
  if (!password) {
    showPopup("❌ Please enter your password.");
    hideLoader();
    return;
  }

  // Firebase login
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      const name = deriveNameFromEmail(email);
      localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));
      hideLoader();
      showPopup("✅ You are successfully logged in.");
      window.location.href = "home.html";
    })
    .catch((error) => {
      hideLoader();

      // Firebase error code handling
      switch (error.code) {
        case 'auth/user-not-found':
          showPopup("❌ This email is not registered. Try signing up.");
          break;
        case 'auth/wrong-password':
          showPopup("❌ Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          showPopup("❌ Invalid email format.");
          break;
        case 'auth/too-many-requests':
          showPopup("⚠️ Too many failed attempts. Please try again later.");
          break;
        default:
          console.error("Login error:", error);
          showPopup("❌ Login failed. Please check your credentials and try again.");
          break;
      }
    });
};



setupPasswordToggle('loginPassword', 'togglePsw');
function setupPasswordToggle(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  icon.addEventListener('click', function () {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
}

function deriveNameFromEmail(email) {
  return email.split('@')[0]
    .replace(/[^a-zA-Z]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

document.querySelector('button[onclick="googleLogin()"]').onclick = () => {
  showLoader(); // ⬅️ Show loader here
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {

      showLoader(); // ⬅️ Show loader here
      const user = result.user;
      const name = user.displayName || deriveNameFromEmail(user.email);
      const email = user.email;

      localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));
      hideLoader(); // ⬅️ Hide loader at end
      showPopup("Successfully logged in with Google.")
      window.location.href = "home.html";
    })
    .catch(error => {
      // document.getElementById("loginError").innerText = error.message;
      showPopup("Unable to login with Google. Try again..!")
      hideLoader(); // ⬅️ Hide loader at end
    });
};

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}


// ✅ Attach to global window so it's callable in HTML onclick
window.sendPasswordReset = sendPasswordReset;

function sendPasswordReset() {
  console.log("Forgot clicked");

  const email = document.getElementById("loginEmail")?.value;

  if (!email) {
    showPopup("Please enter your email in the input field first.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      showPopup(`🔑 Password reset email sent to ${email}`);
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        showPopup("❌ No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        showPopup("❌ Invalid email format.");
      } else {
        showPopup("❌ " + error.message);
      }
    });
}

function showPopup(message, duration = 3000) {
  const popup = document.getElementById("customPopup");
  const msgBox = document.getElementById("popupMessage");

  if (popup && msgBox) {
    msgBox.textContent = message;
    popup.classList.add("show");
    popup.classList.remove("hidden");

    setTimeout(() => {
      popup.classList.remove("show");
      popup.classList.add("hidden");
    }, duration);
  }
}
