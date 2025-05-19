// dash.js – Interactive Google Auth Dashboard

const firebaseConfig = {
  apiKey: "AIzaSyDMhX8gvvnidnWvE4zm7CkMqXOgCiLrgVU",
  authDomain: "big-pocket-80563.firebaseapp.com",
  projectId: "big-pocket-80563",
  storageBucket: "big-pocket-80563.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:363055605173:web:1f4e0bb050e7e3429fcfbf"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loaderEl      = document.getElementById("global-loader");
const headerEl      = document.querySelector(".dash-header");
const userInfoEl    = document.getElementById("userInfo");
const signOutBtn    = document.getElementById("signOutBtn");

// Utility: show toast messages
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  // fade in
  requestAnimationFrame(() => toast.classList.add("show"));
  // remove after timeout
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}

// Utility: get greeting based on hour
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Show loader before auth check
loaderEl.classList.remove("hidden");

// Listen for auth changes
auth.onAuthStateChanged(user => {
  // hide loader
  loaderEl.classList.add("hidden");

  if (!user) {
    showToast("Not signed in—redirecting to login…", 2000);
    return setTimeout(() => window.location.href = "login.html", 2000);
  }

  // Build user info with photo + greeting
  const name = user.displayName || user.email.split("@")[0];
  const greeting = `${getGreeting()}, ${name}!`;

  userInfoEl.innerHTML = `
    <img src="${user.photoURL || '/assets/default-avatar.png'}" alt="Avatar" class="user-avatar" />
    <span>${greeting}</span>
  `;
});

// Sign-Out flow
signOutBtn.addEventListener("click", async () => {
  const ok = confirm("Are you sure you want to sign out?");
  if (!ok) return;

  showToast("Signing out…");
  try {
    await auth.signOut();
    showToast("Signed out successfully!", 2000);
    setTimeout(() => window.location.href = "login.html", 2000);
  } catch (err) {
    console.error(err);
    showToast("Error signing out. Please try again.", 3000);
  }
});
