// login-app/js/login.js

/*──────────────── Firebase config ───────────────*/
const firebaseConfig = {
    apiKey: "AIzaSyAk4MzQzI9_EPdtf0fVQLnyJb0rYgRMVKA",
    authDomain: "bigpocket-app.firebaseapp.com",
    projectId: "bigpocket-app",
    storageBucket: "bigpocket-app.appspot.com",
    messagingSenderId: "363055605173",
    appId: "1:363055605173:web:1f4e0bb050e7e3429fcfbf"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  /*──────────────── Helpers ───────────────────────*/
  const loaderEl = () => document.getElementById("global-loader");
  const toastEl  = () => document.getElementById("message");
  
  function showLoader()  { loaderEl()?.classList.remove("hidden"); }
  function hideLoader()  { loaderEl()?.classList.add("hidden"); }
  function showToast(msg) {
    const t = toastEl();
    if (!t) return console.warn("No #message element for toast");
    t.textContent = msg;
    t.classList.add("visible");
    setTimeout(() => t.classList.remove("visible"), 3500);
  }
  
  function boomConfetti() {
    confetti({ particleCount: 120, spread: 70, startVelocity: 45, origin: { y: 0.7 } });
  }
  
  function morphLoaderToCheck() {
    const svgPath = document.querySelector("#loader-path");
    if (!svgPath) return console.warn("No #loader-path SVG found");
    anime({
      targets:        svgPath,
      d:              [{ value: "M10 15l5 5l10 -10" }],
      strokeDashoffset: [anime.setDashoffset, 0],
      easing:         "easeInOutQuad",
      duration:       600
    });
  }
  
  /*──────────── DOM ready ───────────────*/
  document.addEventListener("DOMContentLoaded", () => {
    const gBtn = document.getElementById("googleSignInBtn");
    if (!gBtn) {
      console.error("❌ #googleSignInBtn not found in DOM");
      return;
    }
  
    // debug to ensure binding
    console.log("✅ googleSignInBtn found, binding click handler");
  
    gBtn.addEventListener("click", () => {
      console.log("👉 Continue with Google clicked");
      showLoader();
  
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(({ user }) => {
          morphLoaderToCheck();
          boomConfetti();
          showToast(`Welcome, ${user.displayName}!`);
  
          // full-screen overlay
          const overlay = document.createElement("div");
          overlay.id = "welcomeOverlay";
          overlay.innerHTML = `
            <div class="welcome-card">
              <h1>👋 Hey, ${user.displayName}!</h1>
              <p>Glad to have you back at BIG Pocket.</p>
            </div>`;
          document.body.appendChild(overlay);
  
          setTimeout(() => {
            window.location.href = "/index.html";
          }, 3000);
        })
        .catch(err => {
          console.error("Sign-in error:", err);
          showToast("Sign-in failed: " + err.message);
        })
        .finally(() => hideLoader());
    });
  
    // auth‐state UI
    renderAuthLinks();
  });
  
  
  /*──── Confetti helper (single short burst) ──────*/
  function boomConfetti() {
    confetti({
      particleCount: 120,
      spread: 70,
      startVelocity: 45,
      origin: { y: 0.7 }
    });
  }
  
  /*──── Morph loader into check-mark (Anime.js) ───*/
  function morphLoaderToCheck() {
    const svgPath = document.querySelector("#loader-path");
    anime({
      targets : svgPath,
      d       : [{ value: "M10 15l5 5l10 -10" }],  // ✔ path
      strokeDashoffset: [anime.setDashoffset, 0],
      easing : "easeInOutQuad",
      duration: 600
    });
  }
  
  /*──────────── Google Sign-In flow ───────────────*/
  document.getElementById("googleSignInBtn")?.addEventListener("click", () => {
    showLoader();
  
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(({ user }) => {
        morphLoaderToCheck();
        boomConfetti();
        showToast(`Welcome, ${user.displayName}!`);
  
        // Show full-screen welcome overlay
        const overlay = document.createElement('div');
        overlay.id = 'welcomeOverlay';
        overlay.innerHTML = `
          <div class="welcome-card">
            <h1>👋 Hey, ${user.displayName}!</h1>
            <p>Glad to have you back at BIG Pocket.</p>
          </div>`;
        document.body.appendChild(overlay);
  
        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 3000);
      })
      .catch(err => {
        console.error("Sign-in error:", err);
        showToast("Sign-in failed: " + err.message);
      })
      .finally(() => {
        hideLoader();
      });
  });
  
  /*────── Auth UI rendering ─────────────────────*/
  function renderAuthLinks() {
    const loginBtn    = document.getElementById("loginBtn");
    const logoutBtn   = document.getElementById("logoutBtn");
    const profileBox  = document.getElementById("profileSection");
    const userPic     = document.getElementById("userPic");
    const userName    = document.getElementById("userName");
    const userEmail   = document.getElementById("userEmail");
  
    auth.onAuthStateChanged(user => {
      if (user) {
        loginBtn    && (loginBtn.style.display   = "none");
        logoutBtn   && (logoutBtn.style.display  = "inline-block");
        profileBox  && (profileBox.style.display = "flex");
        userPic     && (userPic.src             = user.photoURL || "");
        userName    && (userName.textContent    = user.displayName || "");
        userEmail   && (userEmail.textContent   = user.email || "");
      } else {
        loginBtn    && (loginBtn.style.display   = "inline-block");
        logoutBtn   && (logoutBtn.style.display  = "none");
        profileBox  && (profileBox.style.display = "none");
      }
    });
  
    // Logout button logic
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        auth.signOut().then(() => {
          window.location.href = "/login-app/login.html";
        });
      };
    }
  }
  
  // Expose globally for other scripts
  window.renderAuthLinks = renderAuthLinks;
  
  // Auto-render if navbar is already present
  if (document.getElementById("loginBtn")) {
    renderAuthLinks();
  }
  