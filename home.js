import { auth } from './firebase-config.js';
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const allowedEmails = ["omkarchikkodi26@gmail.com", "rahulpattadi@gmail.com"];

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Show user UI, hide login/signup
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("userSection").classList.remove("hidden");
    document.getElementById("userEmail").innerText = user.email;
    document.getElementById("userName").innerText =
      user.displayName || user.email.split("@")[0];

    // ✅ Show uploader link only to admin
    if (allowedEmails.includes(user.email)) {
      const quizUploaderLink = document.getElementById("quizUploaderLink");
      if (quizUploaderLink) {
        quizUploaderLink.style.display = "list-item";
      }
    }
  } else {
    // Show login/signup, hide user section
    document.getElementById("authSection").classList.remove("hidden");
    document.getElementById("userSection").classList.add("hidden");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const profileWrapper = document.getElementById('profileWrapper');
  const toggleDropdown = document.getElementById('toggleDropdown');
  const profileDropdown = document.getElementById('profileDropdown');
  const profilePanel = document.getElementById('profilePanel');

  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) return;

  // Hide auth buttons, show profile info
  document.getElementById('authSection')?.classList.add('hidden');
  document.getElementById('userSection')?.classList.remove('hidden');

  // Set basic info
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;

  // Toggle dropdown on SVG click
  toggleDropdown.addEventListener('click', () => {
    console.log('Dropdown toggle clicked');
    profileDropdown.classList.toggle('hidden');
  });
});

// Open sidebar
function openProfile() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    alert("No user data found.");
    return;
  }

  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('stateDropdown').value = user.state || "";
  document.getElementById('classDropdown').value = user.class || "";

  document.getElementById('profilePanel').classList.remove('hidden');
  document.getElementById('profilePanel').classList.add('open');
  document.getElementById('profileDropdown').classList.add('hidden');
}

// Save user data
function saveProfile() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const state = document.getElementById('stateDropdown').value;
  const userClass = document.getElementById('classDropdown').value;

  if (!state || !userClass) {
    alert("Please select both state and class.");
    return;
  }

  user.state = state;
  user.class = userClass;
  localStorage.setItem('loggedInUser', JSON.stringify(user));

  alert("Profile updated!");
  document.getElementById('profilePanel').classList.remove('open');
}

// Logout
function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'home.html';
}
