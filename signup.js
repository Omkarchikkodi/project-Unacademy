// signup.js
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// signup.js

window.storedOTP = '';
let userEmail = '';
let userPassword = '';
let passwordIsStrong = false;


document.getElementById("email").addEventListener("input", async function () {
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
      statusEl.style.color = "red";
      statusEl.textContent = "❌ This email is already registered. Try logging in.";
    } else {
      statusEl.style.color = "green";
      statusEl.textContent = "✅ You can use this email.";
    }
  } catch (err) {
    console.error("Firestore email check error:", err);
    statusEl.style.color = "red";
    statusEl.textContent = "❌ Error checking email.";
  }

  checkFormValidity(); // 🔄 update OTP button state
});

document.getElementById("psw").addEventListener("input", checkFormValidity);
document.getElementById("confirmPsw").addEventListener("input", function () {
  const password = document.getElementById("psw").value;
  const confirm = this.value;
  const msg = document.getElementById("matchMsg");

  if (confirm === '') {
    msg.textContent = '';
  } else if (password === confirm) {
    msg.textContent = '✅ Passwords match';
    msg.style.color = 'green';
  } else {
    msg.textContent = '❌ Passwords do not match';
    msg.style.color = 'red';
  }

  checkFormValidity(); // 🔄 update OTP button state
});


// Ensure DOM is ready before adding event
document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("googleSignupBtn");

  if (!googleBtn) {
    console.error("Google Signup Button not found!");
    return;
  }

  googleBtn.addEventListener("click", async () => {
    console.log("Google login clicked");

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const name = user.displayName || deriveNameFromGmail(user.email);
      const email = user.email;
      const uid = user.uid;
      const signupMethod = 'google'; // helpful for future reference
      // const createdAt = new Date();

      console.log("Google login successful:", { name, email });

      // Save to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify({ name, email }));

      // 🔍 Check if user document already exists
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // ✅ Only create new doc if not exists
        const createdAt = new Date();
        await setDoc(userDocRef, { email, name, signupMethod, createdAt });
        console.log("📝 New user document created.");
      } else {
        console.log("✅ Existing user found. Skipping overwrite.");
      }

      window.location.href = "home.html";
    } catch (error) {
      console.error("Google login failed:", error);
      document.getElementById("loginError").innerText = error.message;
    }
  });
});


setupPasswordToggle('psw', 'togglePsw');
setupPasswordToggle('confirmPsw', 'toggleConfirmPsw');

// Confirm password match check
document.getElementById('confirmPsw').addEventListener('input', function () {
  const password = document.getElementById('psw').value;
  const confirm = this.value;
  const msg = document.getElementById('matchMsg');

  if (confirm === '') {
    msg.textContent = '';
  } else if (password === confirm) {
    msg.textContent = '✅ Passwords match';
    msg.style.color = 'green';
  } else {
    msg.textContent = '❌ Passwords do not match';
    msg.style.color = 'red';
  }
});

const signupButton = document.getElementById("signupButton");

function checkFormValidity() {
  const emailStatus = document.getElementById("emailStatus").textContent.includes("✅");
  const password = document.getElementById("psw").value;
  const confirmPassword = document.getElementById("confirmPsw").value;
  const passwordValid = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password);
  const passwordsMatch = password === confirmPassword;

  if (emailStatus && passwordValid && passwordsMatch) {
    signupButton.disabled = false;
    console.log("email status : " + emailStatus);
    console.log("password valid : " + passwordValid);
    console.log("password match : " + passwordsMatch);
  } else {
    console.log("email status : " + emailStatus);
    console.log("password valid : " + passwordValid);
    console.log("password match : " + passwordsMatch);
    // showPopup("Fill all the details to send you OTP.");
    signupButton.disabled = true;
  }
}


function deriveNameFromEmail(email) {
  const namePart = email.split('@')[0];
  return namePart.replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

window.generatedOTP = ""; // Global OTP

window.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

window.sendOTP = function () {
  showLoader(); // ⬅️ Show loader here
  const email = document.getElementById("email").value;

  if (!email) {
    showPopup("Please enter a valid email address.");
    hideLoader();
    return;
  }
  if (!passwordIsStrong) {
    showPopup("Please enter a strong password that meets all the conditions before sending OTP.");
    hideLoader();
    return;
  }


  // Hide password rules if password is valid
  document.getElementById("message").style.display = "none";

  window.generatedOTP = window.generateOTP();
  window.storedOTP = window.generatedOTP;
  const templateParams = {
    to_email: email,
    otp: window.generatedOTP
  };

  emailjs.send("service_o6p9vms", "template_64g6qca", templateParams)
    .then(() => {
      document.getElementById("status").innerText = "OTP sent successfully!";
      document.getElementById("otp-section").style.display = "block";
      hideLoader(); // ⬅️ Hide loader at end
    }, (error) => {
      document.getElementById("status").innerText = "Failed to send OTP.";
      console.error("Error:", error);
      hideLoader(); // ⬅️ Hide loader at end
    });

};

window.isPasswordStrong = function () {
  const password = document.getElementById("psw").value;

  const isLongEnough = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  return (isLongEnough && hasUppercase && hasLowercase && hasDigit);
}


window.verifyOTP = function () {
  showLoader();

  const enteredOTP = document.getElementById("otp").value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('psw').value;

  if (enteredOTP === window.generatedOTP.toString()) {
    document.getElementById("verifyStatus").innerText = "✅ OTP Verified!";

    // ✅ Step 1: Create user in Firebase Auth (register password method)
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("✅ Auth user created:", userCredential.user.email); // <--- MUST SEE THIS

        // ✅ Step 2: Add custom metadata to Firestore for tracking
        return setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: deriveNameFromGmail(user.email),
          signupMethod: 'email', // helpful for future reference
          createdAt: new Date()
        });
      })
      .then(() => {
        showPopup("🎉 Account created! You can now log in.");
        hideLoader();

        // ✅ Redirect safely
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      })
      .catch((error) => {
        // showPopup("❌ Signup error: " + error.message);
        showPopup("❌ Signup error : This account already exist..!");
        hideLoader();
      });
  } else {
    document.getElementById("verifyStatus").innerText = "❌ Invalid OTP!";
  }
};

// Helper function
function deriveNameFromGmail(email) {
  return email.split('@')[0]
    .replace(/[^a-zA-Z]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

var myInput = document.getElementById("psw");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");

// When the user clicks on the password field, show the message box
myInput.onfocus = function () {
  document.getElementById("message").style.display = "block";
  if (passwordIsStrong) {
    setTimeout(() => {
      document.getElementById("message").style.display = "none";
    }, 200);
  }
}

// When the user clicks outside of the password field, hide the message box
// myInput.onblur = function () {
//   if (passwordIsStrong){
//     setTimeout(() => {
//       document.getElementById("message").style.display = "none";
//     }, 200);
//   }
// };

// When the user starts to type something inside the password field
myInput.onkeyup = function () {
  // Validate lowercase letters
  var lowerCaseLetters = /[a-z]/g;
  if (myInput.value.match(lowerCaseLetters)) {
    letter.classList.remove("invalid");
    letter.classList.add("valid");
  } else {
    letter.classList.remove("valid");
    letter.classList.add("invalid");
  }

  // Validate capital letters
  var upperCaseLetters = /[A-Z]/g;
  if (myInput.value.match(upperCaseLetters)) {
    capital.classList.remove("invalid");
    capital.classList.add("valid");
  } else {
    capital.classList.remove("valid");
    capital.classList.add("invalid");
  }

  // Validate numbers
  var numbers = /[0-9]/g;
  if (myInput.value.match(numbers)) {
    number.classList.remove("invalid");
    number.classList.add("valid");
  } else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }

  // Validate length
  if (myInput.value.length >= 8) {
    length.classList.remove("invalid");
    length.classList.add("valid");
  } else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }

  // At the end of the onkeyup function
  passwordIsStrong = isPasswordStrong();

}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

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
