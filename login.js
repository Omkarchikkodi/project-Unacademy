import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.querySelector('button[onclick="loginUser()"]').onclick = () => {
  showLoader(); // ⬅️ Show loader here
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email) {
    showPopup("Please enter a valid email address.");
    hideLoader();
    return;
  }
  if (!password) {
    showPopup("Please enter the password for your account.");
    hideLoader();
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      const name = deriveNameFromEmail(email);
      localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));
      hideLoader(); // ⬅️ Hide loader at end
      showPopup("You are successfully logged in to your account.");
      window.location.href = "home.html";
    })
    .catch(() =>{
      showPopup("Account is not yet signed up. Try signing up.");
      hideLoader(); // ⬅️ Hide loader at end
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
