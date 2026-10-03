const USERS_KEY = "robloxconnect-users";
const SESSION_KEY = "robloxconnect-session";

const loginTab = document.querySelector("[data-tab='loginTab']");
const signupTab = document.querySelector("[data-tab='signupTab']");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function setActiveTab(tabName) {
  const isLogin = tabName === "loginTab";
  loginTab.classList.toggle("active", isLogin);
  signupTab.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("hidden", !isLogin);
  signupForm.classList.toggle("hidden", isLogin);
}

function renderDashboard(user) {
  dashboard.classList.remove("hidden");
  document.getElementById("welcomeTitle").textContent = `Welcome, ${user.username}!`;
  document.getElementById("profileUsername").textContent = user.username;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileDate").textContent = new Date(user.createdAt).toLocaleDateString();

  const robloxStatus = document.getElementById("robloxStatus");
  const robloxInput = document.getElementById("robloxInput");
  if (user.robloxUsername) {
    robloxStatus.textContent = `Linked Roblox account: @${user.robloxUsername}`;
    robloxInput.value = user.robloxUsername;
  } else {
    robloxStatus.textContent = "No Roblox account linked yet.";
    robloxInput.value = "";
  }
}

function hideDashboard() {
  dashboard.classList.add("hidden");
  logoutBtn.classList.add("hidden");
}

function storeUserSession(user) {
  setSession({
    id: user.id,
    username: user.username,
    email: user.email,
    robloxUsername: user.robloxUsername || "",
    createdAt: user.createdAt,
  });
  renderDashboard({
    ...user,
    robloxUsername: user.robloxUsername || "",
  });
  logoutBtn.classList.remove("hidden");
}

function createUser(username, email, password, robloxUsername = "") {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    username,
    email,
    password,
    robloxUsername,
    createdAt: new Date().toISOString(),
  };
}

loginTab.addEventListener("click", () => setActiveTab("loginTab"));
signupTab.addEventListener("click", () => setActiveTab("signupTab"));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const users = getUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);

  if (!user) {
    showToast("Invalid email or password.");
    return;
  }

  storeUserSession(user);
  loginForm.reset();
  showToast("Logged in successfully.");
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const robloxUsername = document.getElementById("signupRoblox").value.trim();

  const users = getUsers();
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    showToast("An account with that email already exists.");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters.");
    return;
  }

  const nextUser = createUser(username, email, password, robloxUsername);
  users.push(nextUser);
  saveUsers(users);
  signupForm.reset();
  setActiveTab("loginTab");
  showToast("Account created successfully.");
});

logoutBtn.addEventListener("click", () => {
  clearSession();
  hideDashboard();
  showToast("You have been logged out.");
});

document.getElementById("linkRobloxBtn").addEventListener("click", () => {
  const session = getSession();
  if (!session) {
    showToast("Please log in first.");
    return;
  }

  const username = document.getElementById("robloxInput").value.trim();
  if (!username) {
    showToast("Enter a Roblox username to link.");
    return;
  }

  const users = getUsers();
  const userIndex = users.findIndex((entry) => entry.id === session.id);

  if (userIndex === -1) {
    showToast("Your session could not be found.");
    return;
  }

  users[userIndex].robloxUsername = username;
  saveUsers(users);
  setSession(users[userIndex]);
  renderDashboard(users[userIndex]);
  showToast("Roblox account linked.");
});

function initializeApp() {
  setActiveTab("loginTab");
  const session = getSession();

  if (session) {
    const users = getUsers();
    const currentUser = users.find((user) => user.id === session.id);
    if (currentUser) {
      storeUserSession(currentUser);
      return;
    }
  }

  hideDashboard();
}

initializeApp();
