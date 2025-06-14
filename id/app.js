// 🔥 Paste your Firebase config below:
const firebaseConfig = {
  apiKey: "AIzaSyA8HcTDiCQtJHRiMES2p1iUlA30AkZPx1Y",
  authDomain: "polor-62c29.firebaseapp.com",
  projectId: "polor-62c29",
  appId: "1:232986823513:web:a6ee6bef6b0609ace3da48"
};

// 🔧 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 🎯 Hook up event listeners
window.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  document.getElementById("signupBtn").onclick = () => {
    auth.createUserWithEmailAndPassword(email.value.trim(), password.value.trim())
      .then(() => alert("Signed up!"))
      .catch(err => alert(err.message));
  };

  document.getElementById("loginBtn").onclick = () => {
    auth.signInWithEmailAndPassword(email.value.trim(), password.value.trim())
      .then(() => alert("Logged in!"))
      .catch(err => alert(err.message));
  };

  document.getElementById("logoutBtn").onclick = () => {
    auth.signOut().then(() => alert("Logged out"));
  };
});

// 👁️ Auth state change
auth.onAuthStateChanged(user => {
  const authBox = document.getElementById("auth-box");
  const userBox = document.getElementById("user-box");
  const welcomeText = document.getElementById("welcomeText");

  if (user) {
    authBox.style.display = "none";
    userBox.style.display = "block";
    welcomeText.innerText = `Welcome, ${user.email}`;
  } else {
    authBox.style.display = "block";
    userBox.style.display = "none";
  }
});
