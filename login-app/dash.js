// dash.js – Google Auth Only
const firebaseConfig = {
    apiKey: "AIzaSyDMhX8gvvnidnWvE4zm7CkMqXOgCiLrgVU",
    authDomain: "big-pocket-80563.firebaseapp.com",
    projectId: "big-pocket-80563",
    storageBucket: "big-pocket-80563.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Match login.js
    appId: "1:363055605173:web:1f4e0bb050e7e3429fcfbf" // Match login.js
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const userInfoEl = document.getElementById("userInfo");
  const signOutBtn = document.getElementById("signOutBtn");
  
  // Auth Check
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    // Show Google account info
    userInfoEl.textContent = user.displayName || user.email;
  });
  
  // Sign Out
  signOutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
      window.location.href = "login.html";
    } catch (err) {
      alert("Sign-out failed. Please try again.");
    }
  });