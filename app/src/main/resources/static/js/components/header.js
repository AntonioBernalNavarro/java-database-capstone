/*
  Step-by-Step Explanation of Header Section Rendering

  This code dynamically renders the header section of the page based on the user's role, 
  session status, and available actions (such as login, logout, or role-switching).

  1. Define the `renderHeader` Function
  2. Select the Header Div (`#header`)
  3. Check if the Current Page is the Root Page (`/`)
  4. Retrieve Role and Token from LocalStorage
  5. Initialize Header Content (base HTML: logo + nav)
  6. Handle Session Expiry or Invalid Login
  7. Add Role-Specific Header Content
  8. Close the Header Section
  9. Render the Header Content
  10. Attach Event Listeners
  11. Define `attachHeaderButtonListeners`
  12. Define `logout`
  13. Define `logoutPatient`
  14. Call `renderHeader()` on load
*/

/* 1. Define the renderHeader function */
function renderHeader() {

  /* 2. Select the header div */
  const headerDiv = document.getElementById("header");
  if (!headerDiv) return;

  /* 3. Check if the current page is the root page */
  if (window.location.pathname.endsWith("/")) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    headerDiv.innerHTML = `
      <header class="header">
        <div class="logo-section">
          <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
      </header>`;
    return;
  }

  /* 4. Retrieve the user's role and token from localStorage */
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  /* 5. Initialize header content */
  let headerContent = `
    <header class="header">
      <div class="logo-section">
        <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
        <span class="logo-title">Hospital CMS</span>
      </div>
      <nav>`;

  /* 6. Handle session expiry or invalid login */
  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
    localStorage.removeItem("userRole");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/";
    return;
  }

  /* 7. Add role-specific header content */
  if (role === "admin") {
    headerContent += `
      <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "doctor") {
    headerContent += `
      <button class="adminBtn" onclick="selectRole('doctor')">Home</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "patient") {
    headerContent += `
      <button id="patientLogin" class="adminBtn">Login</button>
      <button id="patientSignup" class="adminBtn">Sign Up</button>`;
  } else if (role === "loggedPatient") {
    headerContent += `
      <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
      <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
      <a href="#" onclick="logoutPatient()">Logout</a>`;
  }

  /* 8. Close the header section */
  headerContent += `
      </nav>
    </header>`;

  /* 9. Render the header content */
  headerDiv.innerHTML = headerContent;

  /* 10. Attach event listeners to dynamically created buttons */
  attachHeaderButtonListeners();
}

/* 11. Helper: attachHeaderButtonListeners */
function attachHeaderButtonListeners() {
  // Patient login button (only rendered for role === "patient")
  const patientLogin = document.getElementById("patientLogin");
  if (patientLogin) {
    patientLogin.addEventListener("click", () => {
      localStorage.setItem("userRole", "patient");
      openModal("patientLogin");
    });
  }

  // Patient signup button (only rendered for role === "patient")
  const patientSignup = document.getElementById("patientSignup");
  if (patientSignup) {
    patientSignup.addEventListener("click", () => {
      localStorage.setItem("userRole", "patient");
      openModal("patientSignup");
    });
  }

  // Defensive: admin/doctor login buttons if present in future variants
  const adminLogin = document.getElementById("adminLogin");
  if (adminLogin) {
    adminLogin.addEventListener("click", () => {
      localStorage.setItem("userRole", "admin");
      openModal("adminLogin");
    });
  }

  const doctorLogin = document.getElementById("doctorLogin");
  if (doctorLogin) {
    doctorLogin.addEventListener("click", () => {
      localStorage.setItem("userRole", "doctor");
      openModal("doctorLogin");
    });
  }
}

/* 12. Helper: logout (for admin, doctor, and loggedPatient) */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
}

/* 13. Helper: logoutPatient (keeps role as "patient" to show login/signup again) */
function logoutPatient() {
  localStorage.removeItem("token");
  localStorage.setItem("userRole", "patient");
  window.location.href = "/pages/patientDashboard.html";
}

/* 14. Initialize the header on page load */
renderHeader();